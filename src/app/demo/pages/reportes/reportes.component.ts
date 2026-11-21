import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { FiltrosReporte, ReporteData, ReportesService } from './service/reportes.service';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { Inventario } from 'src/app/models/inventario';
import { MedicoService } from '../medico/service/medico.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { InventarioService } from '../inventario/service/inventario.service';
import { descargarArchivo } from 'src/app/utils/descarga';

/** Definición de un reporte del catálogo. */
interface TipoReporte { codigo: string; nombre: string; filtros?: ('medico' | 'especialidad' | 'medicamento' | 'agrupacion')[]; }

/**
 * Módulo de reportes (solo ADMIN): financieros, de inventario y de gestión médica. Todos permiten
 * rango de fechas, filtros según el reporte, previsualización con totales y descarga en PDF y Excel.
 */
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent {
  readonly categorias: { clave: string; nombre: string; reportes: TipoReporte[] }[] = [
    { clave: 'financieros', nombre: 'Financieros', reportes: [
      { codigo: 'ingresos-periodo', nombre: 'Ingresos por período (pagos recibidos)' },
      { codigo: 'ingresos-consultas', nombre: 'Ingresos por consultas médicas', filtros: ['medico', 'especialidad'] },
      { codigo: 'ingresos-especialidad', nombre: 'Ingresos por especialidad' },
      { codigo: 'ingresos-veterinario', nombre: 'Ingresos por veterinario' },
      { codigo: 'ingresos-medicamentos', nombre: 'Ingresos por venta de medicamentos' },
      { codigo: 'facturas-resumen', nombre: 'Facturas: generadas, pagadas, pendientes, parciales, impuestos y descuentos' },
      { codigo: 'resumen-financiero', nombre: 'Resumen de ingresos por día / mes / año', filtros: ['agrupacion'] }
    ] },
    { clave: 'inventario', nombre: 'Inventario', reportes: [
      { codigo: 'inventario-existencias', nombre: 'Existencias, valor a costo y valor potencial de venta' },
      { codigo: 'inventario-agotados', nombre: 'Medicamentos agotados' },
      { codigo: 'inventario-stock-minimo', nombre: 'Medicamentos con stock mínimo' },
      { codigo: 'inventario-proximos-vencer', nombre: 'Próximos a vencer (30 días)' },
      { codigo: 'inventario-vencidos', nombre: 'Medicamentos vencidos' },
      { codigo: 'inventario-movimientos', nombre: 'Entradas y salidas de inventario' },
      { codigo: 'inventario-historial-medicamento', nombre: 'Historial de movimientos por medicamento', filtros: ['medicamento'] }
    ] },
    { clave: 'medica', nombre: 'Gestión médica', reportes: [
      { codigo: 'citas-periodo', nombre: 'Número de citas por período', filtros: ['medico', 'especialidad'] },
      { codigo: 'citas-estado', nombre: 'Citas atendidas, canceladas y pendientes', filtros: ['medico'] },
      { codigo: 'consultas-veterinario', nombre: 'Consultas realizadas por veterinario' },
      { codigo: 'consultas-especialidad', nombre: 'Consultas realizadas por especialidad' },
      { codigo: 'mascotas-atendidas', nombre: 'Mascotas atendidas por período' }
    ] }
  ];

  categoria = this.categorias[0];
  reporte: TipoReporte = this.categorias[0].reportes[0];
  filtros: FiltrosReporte = { desde: this.mesActual(1), hasta: this.mesActual(0), agrupacion: 'DIA' };
  medicos: Medico[] = [];
  especialidades: Especializacion[] = [];
  medicamentos: Inventario[] = [];
  datos: ReporteData | null = null;
  cargando = false;

  constructor(
    private readonly servicio: ReportesService,
    medicoService: MedicoService,
    especialidadService: EspecializacionService,
    inventarioService: InventarioService
  ) {
    medicoService.listarMedicos().subscribe({ next: (m) => this.medicos = m, error: () => this.medicos = [] });
    especialidadService.listarEspecializaciones().subscribe({ next: (e) => this.especialidades = e, error: () => this.especialidades = [] });
    inventarioService.listar().subscribe({ next: (i) => this.medicamentos = i, error: () => this.medicamentos = [] });
  }

  /** Primer día del mes actual (1) o último (0), en `aaaa-mm-dd`. */
  private mesActual(inicio: number): string {
    const h = new Date();
    const d = inicio ? new Date(h.getFullYear(), h.getMonth(), 1) : new Date(h.getFullYear(), h.getMonth() + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  elegirCategoria(c: { clave: string; nombre: string; reportes: TipoReporte[] }) {
    this.categoria = c;
    this.reporte = c.reportes[0];
    this.datos = null;
  }

  elegirReporte(r: TipoReporte) { this.reporte = r; this.datos = null; }

  usa(f: 'medico' | 'especialidad' | 'medicamento' | 'agrupacion'): boolean { return !!this.reporte.filtros?.includes(f); }

  private validar(): boolean {
    if (!this.filtros.desde || !this.filtros.hasta || this.filtros.desde > this.filtros.hasta) { Swal.fire('Atención', 'Seleccione un rango de fechas válido', 'warning'); return false; }
    if (this.usa('medicamento') && !this.filtros.medicamentoId) { Swal.fire('Atención', 'Seleccione el medicamento', 'warning'); return false; }
    return true;
  }

  previsualizar() {
    if (!this.validar()) { return; }
    this.cargando = true;
    this.servicio.previsualizar(this.reporte.codigo, this.filtros).subscribe({
      next: (d) => { this.datos = d; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo generar el reporte', 'error'); }
    });
  }

  exportar(formato: 'pdf' | 'xlsx') {
    if (!this.validar()) { return; }
    this.servicio.exportar(this.reporte.codigo, this.filtros, formato).subscribe({
      next: (b) => descargarArchivo(b, `${this.reporte.codigo}_${this.filtros.desde}_${this.filtros.hasta}.${formato}`),
      error: () => Swal.fire('Error', 'No se pudo descargar el reporte', 'error')
    });
  }

  totales(): { clave: string; valor: unknown }[] {
    return Object.entries(this.datos?.totales ?? {}).map(([clave, valor]) => ({ clave, valor }));
  }
}
