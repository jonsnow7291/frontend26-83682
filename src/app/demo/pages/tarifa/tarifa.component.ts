import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Tarifa, TarifaLog, TarifaRq } from 'src/app/models/tarifa';
import { Especializacion } from 'src/app/models/especializacion';
import { TarifaService } from './service/tarifa.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';

/**
 * Administración de tarifas por especialidad y servicio (valor e IVA) con su historial de cambios.
 * Un administrador cambia los valores sin tocar código; las facturas ya emitidas no se alteran.
 */
@Component({
  selector: 'app-tarifa',
  imports: [CommonModule, FormsModule],
  templateUrl: './tarifa.component.html'
})
export class TarifaComponent {
  tarifas: Tarifa[] = [];
  especialidades: Especializacion[] = [];
  filtroEspecialidad: number | null = null;
  cargando = false;
  form: TarifaRq = this.vacia();
  titleModal = '';
  historial: TarifaLog[] = [];
  tarifaHistorial: Tarifa | null = null;
  private modalForm: Modal | null = null;
  private modalLog: Modal | null = null;

  constructor(private readonly servicio: TarifaService, private readonly especialidadService: EspecializacionService) {
    this.especialidadService.listarEspecializaciones().subscribe({ next: (e) => this.especialidades = e, error: () => this.especialidades = [] });
    this.listar();
  }

  nombreEspecialidad(id?: number): string {
    return this.especialidades.find((e) => e.id === id)?.nombre ?? String(id ?? '');
  }

  listar() {
    this.cargando = true;
    this.servicio.listar(this.filtroEspecialidad, true).subscribe({
      next: (t) => { this.tarifas = t; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar las tarifas', 'error'); }
    });
  }

  nueva() { this.form = this.vacia(); this.titleModal = 'Nueva tarifa'; this.abrir('modalTarifa', (m) => this.modalForm = m); }

  editar(t: Tarifa) {
    this.form = { id: t.id, especializacionId: t.especializacionId!, servicio: t.servicio ?? '', valor: t.valor ?? 0, ivaPorcentaje: t.ivaPorcentaje ?? 0, activa: t.activa };
    this.titleModal = 'Modificar tarifa';
    this.abrir('modalTarifa', (m) => this.modalForm = m);
  }

  guardar() {
    const f = this.form;
    if (!f.especializacionId || !f.servicio?.trim()) { Swal.fire('Atención', 'Especialidad y servicio son obligatorios', 'warning'); return; }
    if (f.valor == null || f.valor < 0 || f.ivaPorcentaje == null || f.ivaPorcentaje < 0 || f.ivaPorcentaje > 100) { Swal.fire('Atención', 'El valor no puede ser negativo y el IVA debe estar entre 0 y 100', 'warning'); return; }
    const peticion = f.id ? this.servicio.actualizar(f) : this.servicio.crear(f);
    peticion.subscribe({
      next: () => { this.modalForm?.hide(); Swal.fire('Éxito', 'Tarifa guardada; el cambio quedó en el historial', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  cambiarEstado(t: Tarifa) {
    this.servicio.cambiarEstado(t.id!, !t.activa).subscribe({ next: () => this.listar(), error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cambiar el estado', 'error') });
  }

  verHistorial(t: Tarifa) {
    this.tarifaHistorial = t;
    this.historial = [];
    this.servicio.historial(t.id!).subscribe({ next: (h) => this.historial = h, error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el historial', 'error') });
    this.abrir('modalLogTarifa', (m) => this.modalLog = m);
  }

  private abrir(id: string, guardar: (m: Modal) => void) {
    const el = document.getElementById(id);
    if (el) { const m = new Modal(el); guardar(m); m.show(); }
  }

  private vacia(): TarifaRq { return { especializacionId: 0, servicio: '', valor: 0, ivaPorcentaje: 0 }; }
}
