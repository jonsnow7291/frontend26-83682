import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { DisponibilidadFormula, FormulaLineaRq, FormulaMedica, FormulaMedicaRq } from 'src/app/models/formula-medica';
import { Inventario } from 'src/app/models/inventario';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Cita } from 'src/app/models/cita';
import { AuthService } from 'src/app/services/auth.service';
import { FormulaMedicaService } from './service/formula-medica.service';
import { InventarioService } from '../inventario/service/inventario.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { CitaService } from '../cita/service/cita.service';
import { CalendarioService } from '../calendario/service/calendario.service';
import { abrirPdf } from 'src/app/utils/descarga';

/**
 * Fórmulas médicas con varios medicamentos. El médico las crea (borrador), consulta la
 * disponibilidad y las confirma; solo entonces pasan a despacho. Formular NO descuenta inventario:
 * el descuento ocurre cuando el despacho confirma la entrega.
 */
@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule],
  templateUrl: './formula-medica.component.html'
})
export class FormulaMedicaComponent {
  formulas: FormulaMedica[] = [];
  cargando = false;
  citaFiltro: number | null = null;
  readonly esMedico: boolean;

  // formulario
  titleModal = '';
  formulaId: number | undefined;
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  clienteId: number | null = null;
  mascotaId: number | null = null;
  citaId: number | null = null;
  citaFija: Cita | null = null;
  indicaciones = '';
  lineas: FormulaLineaRq[] = [];
  medicamentos: Inventario[] = [];
  guardando = false;
  private modalForm: Modal | null = null;

  // detalle
  detalle: FormulaMedica | null = null;
  disponibilidad: DisponibilidadFormula[] = [];
  private modalDetalle: Modal | null = null;

  constructor(
    private readonly servicio: FormulaMedicaService,
    private readonly inventario: InventarioService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly citaService: CitaService,
    private readonly calendario: CalendarioService,
    authService: AuthService,
    ruta: ActivatedRoute
  ) {
    this.esMedico = authService.tieneRol(['MEDICO']);
    this.inventario.listar('TODOS', 'MEDICAMENTO').subscribe({ next: (m) => this.medicamentos = m.filter((x) => x.activo), error: () => this.medicamentos = [] });
    this.clienteService.listarClientes().subscribe({ next: (c) => this.clientes = c, error: () => this.clientes = [] });
    ruta.queryParamMap.subscribe((p) => {
      this.citaFiltro = Number(p.get('citaId')) || null;
      this.listar();
    });
  }

  listar() {
    this.cargando = true;
    this.servicio.listarFormulas(this.citaFiltro).subscribe({
      next: (f) => { this.formulas = f; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar las fórmulas', 'error'); }
    });
  }

  quitarFiltro() { this.citaFiltro = null; this.listar(); }

  /** `true` si todavía se puede editar (borrador, o confirmada sin despachar). */
  editable(f: FormulaMedica): boolean {
    return f.estado === 'BORRADOR' || f.estadoDespacho === 'PENDIENTE_DESPACHO';
  }

  estadoClase(f: FormulaMedica): string {
    return f.estado === 'BORRADOR' ? 'bg-warning text-dark' : 'bg-success';
  }

  // ----- alta / edición -----
  nueva() {
    this.formulaId = undefined;
    this.indicaciones = '';
    this.lineas = [this.lineaVacia()];
    this.clienteId = this.mascotaId = this.citaId = null;
    this.mascotas = []; this.citas = []; this.citaFija = null;
    this.titleModal = 'Nueva fórmula médica';
    if (this.citaFiltro) {
      this.citaId = this.citaFiltro;
      this.calendario.consultar(this.citaFiltro).subscribe((c) => this.citaFija = c);
    }
    this.abrir('modalFormula', (m) => this.modalForm = m);
  }

  editar(f: FormulaMedica) {
    this.formulaId = f.id;
    this.citaId = f.cita?.id ?? null;
    this.citaFija = f.cita ?? null;
    this.indicaciones = f.indicaciones ?? '';
    this.lineas = (f.detalles ?? []).map((d) => ({
      medicamentoId: d.medicamento?.id ?? null, dosis: d.dosis ?? '', frecuencia: d.frecuencia ?? '', duracionDias: d.duracionDias ?? null,
      unidadesPorDosis: d.unidadesPorDosis ?? null, dosisPorDia: d.dosisPorDia ?? null, cantidadPrescrita: d.cantidadPrescrita ?? null,
      viaAdministracion: d.viaAdministracion, indicaciones: d.indicaciones
    }));
    this.titleModal = `Editar fórmula #${f.id}`;
    this.abrir('modalFormula', (m) => this.modalForm = m);
  }

  alCambiarCliente() {
    this.mascotaId = null; this.citaId = null; this.mascotas = []; this.citas = [];
    if (this.clienteId) { this.mascotaService.buscarPorCliente(this.clienteId).subscribe({ next: (m) => this.mascotas = m, error: () => this.mascotas = [] }); }
  }

  alCambiarMascota() {
    this.citaId = null; this.citas = [];
    if (this.mascotaId) { this.citaService.listarAtendidasPorMascota(this.mascotaId).subscribe({ next: (c) => this.citas = c, error: () => this.citas = [] }); }
  }

  agregarLinea() { this.lineas.push(this.lineaVacia()); }
  quitarLinea(i: number) { if (this.lineas.length > 1) { this.lineas.splice(i, 1); } }

  medicamento(id: number | null): Inventario | undefined { return this.medicamentos.find((m) => m.id === id); }

  /** Cantidad total requerida: unidades por dosis × dosis por día × duración (si se informan). */
  cantidadCalculada(l: FormulaLineaRq): number | null {
    return l.unidadesPorDosis && l.dosisPorDia && l.duracionDias ? l.unidadesPorDosis * l.dosisPorDia * l.duracionDias : null;
  }

  cantidadFinal(l: FormulaLineaRq): number {
    return this.cantidadCalculada(l) ?? l.cantidadPrescrita ?? 0;
  }

  errorForm(): string | null {
    if (!this.citaId) { return 'Seleccione la cita atendida de la fórmula'; }
    const repetidos = new Set<number>();
    for (const l of this.lineas) {
      if (!l.medicamentoId) { return 'Cada línea requiere un medicamento'; }
      if (repetidos.has(l.medicamentoId)) { return 'Hay un medicamento repetido en la fórmula'; }
      repetidos.add(l.medicamentoId);
      if (!l.dosis?.trim() || !l.frecuencia?.trim()) { return 'Dosis y frecuencia son obligatorias'; }
      if (!l.duracionDias || l.duracionDias <= 0) { return 'La duración debe ser mayor que cero'; }
      if ((l.unidadesPorDosis || l.dosisPorDia) && !this.cantidadCalculada(l)) { return 'Para calcular la cantidad informe unidades por dosis y dosis por día'; }
      if (this.cantidadFinal(l) <= 0) { return 'La cantidad prescrita debe ser mayor que cero'; }
    }
    return null;
  }

  guardar() {
    const error = this.errorForm();
    if (error) { Swal.fire('Atención', error, 'warning'); return; }
    const rq: FormulaMedicaRq = {
      formulaId: this.formulaId, citaId: this.citaId!, indicaciones: this.indicaciones,
      detalles: this.lineas.map((l) => ({ ...l, cantidadPrescrita: this.cantidadFinal(l) }))
    };
    this.guardando = true;
    (this.formulaId ? this.servicio.actualizarFormula(rq) : this.servicio.guardarFormula(rq)).subscribe({
      next: (r) => { this.guardando = false; this.modalForm?.hide(); Swal.fire('Éxito', r.message ?? 'Fórmula guardada', 'success'); this.listar(); },
      error: (e) => { this.guardando = false; Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error'); }
    });
  }

  // ----- confirmar / ver / pdf -----
  confirmar(f: FormulaMedica) {
    Swal.fire({ title: `Confirmar fórmula #${f.id}`, text: 'Pasará al despacho. El inventario solo se descuenta cuando se entregue.', icon: 'question', showCancelButton: true, confirmButtonText: 'Confirmar' })
      .then((r) => {
        if (!r.isConfirmed) { return; }
        this.servicio.confirmar(f.id!).subscribe({
          next: (rs) => { Swal.fire('Éxito', rs.message ?? 'Fórmula confirmada', 'success'); this.listar(); },
          error: (e) => Swal.fire('No se pudo confirmar', e?.error?.message ?? 'Error inesperado', 'error')
        });
      });
  }

  ver(f: FormulaMedica) {
    this.detalle = f;
    this.disponibilidad = [];
    this.servicio.disponibilidad(f.id!).subscribe({ next: (d) => this.disponibilidad = d, error: () => this.disponibilidad = [] });
    this.abrir('modalDetalleFormula', (m) => this.modalDetalle = m);
  }

  disponible(medicamentoId?: number): DisponibilidadFormula | undefined {
    return this.disponibilidad.find((d) => d.medicamentoId === medicamentoId);
  }

  pdf(f: FormulaMedica) {
    this.servicio.pdf(f.id!).subscribe({ next: (b) => abrirPdf(b), error: () => Swal.fire('Error', 'No se pudo generar el PDF', 'error') });
  }

  private lineaVacia(): FormulaLineaRq {
    return { medicamentoId: null, dosis: '', frecuencia: '', duracionDias: null, unidadesPorDosis: null, dosisPorDia: null, cantidadPrescrita: null, viaAdministracion: 'Oral', indicaciones: '' };
  }

  private abrir(id: string, guardar: (m: Modal) => void) {
    const el = document.getElementById(id);
    if (el) { const m = new Modal(el); guardar(m); m.show(); }
  }
}
