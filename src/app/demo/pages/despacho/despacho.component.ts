import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { AsignacionLote, DespachoDetalle, DespachoResumen, EstadoLog, MovimientoDespacho } from 'src/app/models/despacho';
import { Inventario } from 'src/app/models/inventario';
import { InventarioService } from '../inventario/service/inventario.service';
import { DespachoService } from './service/despacho.service';
import { abrirPdf } from 'src/app/utils/descarga';

/**
 * Despacho y dispensación de medicamentos (solo DESPACHO_MEDICO). El despachador consulta las
 * fórmulas confirmadas, valida existencias y lotes (FEFO), registra lo efectivamente entregado
 * y confirma; el inventario solo se descuenta al confirmar. No puede modificar dosis ni cantidades
 * prescritas. Las cancelaciones y reversiones requieren la autorización de un ADMIN.
 */
@Component({
  selector: 'app-despacho',
  imports: [CommonModule, FormsModule],
  templateUrl: './despacho.component.html'
})
export class DespachoComponent {
  pestana: 'pendientes' | 'historial' | 'medicamento' = 'pendientes';
  /** Pestaña "Por medicamento" (requisito 5.6): catálogo, selección y movimientos de entrega. */
  medicamentos: Inventario[] = [];
  medicamentoId: number | null = null;
  movimientos: MovimientoDespacho[] = [];
  lista: DespachoResumen[] = [];
  cargando = false;
  busqueda = '';
  fecha = '';

  detalle: DespachoDetalle | null = null;
  asignaciones: AsignacionLote[] = [];
  faltantes: string[] = [];
  /** Cantidad a entregar por línea (detalleId → unidades). */
  entrega: Record<number, number> = {};
  observaciones = '';
  estados: EstadoLog[] = [];
  procesando = false;
  private modalDetalle: Modal | null = null;

  constructor(private readonly servicio: DespachoService, private readonly inventario: InventarioService) {
    this.listar();
  }

  cambiarPestana(p: 'pendientes' | 'historial' | 'medicamento') {
    this.pestana = p;
    if (p === 'medicamento') { this.cargarMedicamentos(); return; }
    this.listar();
  }

  /** Carga el catálogo (una vez) para elegir el medicamento cuyo historial se consulta. */
  cargarMedicamentos() {
    if (this.medicamentos.length > 0) { return; }
    this.inventario.listar().subscribe({
      next: (d) => this.medicamentos = d.filter((m) => m.tipo !== 'UTENSILIO'),
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el catálogo', 'error')
    });
  }

  /** Historial de entregas y reversiones del medicamento elegido. */
  consultarMedicamento() {
    this.movimientos = [];
    if (!this.medicamentoId) { return; }
    this.cargando = true;
    this.servicio.historialMedicamento(this.medicamentoId).subscribe({
      next: (m) => { this.movimientos = m; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el historial', 'error'); }
    });
  }

  listar() {
    this.cargando = true;
    if (this.pestana === 'medicamento') { return; }
    const origen = this.pestana === 'pendientes' ? this.servicio.pendientes(this.busqueda.trim(), this.fecha) : this.servicio.historial();
    origen.subscribe({
      next: (d) => { this.lista = d; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los despachos', 'error'); }
    });
  }

  estadoClase(e: string): string {
    return ({ PENDIENTE_DESPACHO: 'bg-warning text-dark', EN_PREPARACION: 'bg-info text-dark', DESPACHO_PARCIAL: 'bg-primary', DESPACHADO: 'bg-success',
      PENDIENTE_DISPONIBILIDAD: 'bg-danger', CANCELADO: 'bg-secondary' } as Record<string, string>)[e] ?? 'bg-secondary';
  }

  vigenciaClase(v: string): string {
    return v === 'VENCIDO' ? 'bg-danger' : v === 'PROXIMO_A_VENCER' ? 'bg-warning text-dark' : 'bg-success';
  }

  /** `true` mientras se puede preparar o confirmar. */
  get operable(): boolean {
    return !!this.detalle && ['PENDIENTE_DESPACHO', 'EN_PREPARACION', 'DESPACHO_PARCIAL', 'PENDIENTE_DISPONIBILIDAD'].includes(this.detalle.estado);
  }

  /** El backend permite iniciar (o reiniciar) la preparación desde estos estados. */
  get puedePreparar(): boolean {
    return !!this.detalle && ['PENDIENTE_DESPACHO', 'PENDIENTE_DISPONIBILIDAD', 'DESPACHO_PARCIAL'].includes(this.detalle.estado);
  }

  get confirmado(): boolean {
    return !!this.detalle && ['DESPACHADO', 'DESPACHO_PARCIAL'].includes(this.detalle.estado);
  }

  abrir(r: DespachoResumen) {
    this.asignaciones = []; this.faltantes = []; this.observaciones = ''; this.estados = [];
    this.servicio.detallePorFormula(r.formulaId).subscribe({
      next: (d) => { this.cargarDetalle(d); this.mostrar(); },
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el detalle', 'error')
    });
    this.servicio.estados(r.id).subscribe({ next: (e) => this.estados = e, error: () => this.estados = [] });
  }

  private cargarDetalle(d: DespachoDetalle) {
    this.detalle = d;
    this.entrega = {};
    d.lineas.forEach((l) => this.entrega[l.detalleId] = Math.min(l.pendiente, l.stockVigente));
  }

  /** Mayor cantidad entregable de una línea (nunca más de lo pendiente ni de lo disponible). */
  maximo(l: { pendiente: number; stockVigente: number }): number { return Math.min(l.pendiente, l.stockVigente); }

  preparar() {
    this.procesando = true;
    this.servicio.preparar(this.detalle!.despachoId).subscribe({
      next: (s) => { this.asignaciones = s.asignaciones; this.faltantes = s.faltantes; this.procesando = false; this.recargar(); },
      error: (e) => { this.procesando = false; Swal.fire('No se pudo preparar', e?.error?.message ?? 'Error inesperado', 'error'); }
    });
  }

  private recargar() {
    this.servicio.detallePorFormula(this.detalle!.formulaId).subscribe((d) => this.cargarDetalle(d));
    this.listar();
  }

  confirmar() {
    for (const l of this.detalle!.lineas) {
      const c = this.entrega[l.detalleId] ?? 0;
      if (c < 0 || c > this.maximo(l)) { Swal.fire('Atención', `La cantidad de ${l.medicamento} debe estar entre 0 y ${this.maximo(l)}`, 'warning'); return; }
    }
    const total = Object.values(this.entrega).reduce((a, b) => a + b, 0);
    if (total === 0) { Swal.fire('Atención', 'No hay unidades para entregar (sin existencias o cantidades en cero)', 'warning'); return; }
    Swal.fire({ title: 'Confirmar entrega', text: 'Se descontará del inventario y no podrá eliminarse (solo reversarse con autorización).', icon: 'question', showCancelButton: true, confirmButtonText: 'Confirmar entrega' })
      .then((r) => {
        if (!r.isConfirmed) { return; }
        this.procesando = true;
        const lineas = this.detalle!.lineas.map((l) => ({ detalleId: l.detalleId, cantidad: this.entrega[l.detalleId] ?? 0 }));
        this.servicio.confirmar(this.detalle!.despachoId, lineas, this.observaciones).subscribe({
          next: (d) => {
            this.procesando = false;
            this.cargarDetalle(d);
            Swal.fire('Entrega registrada', `Estado: ${d.estado}`, 'success');
            this.servicio.estados(d.despachoId).subscribe((e) => this.estados = e);
            this.listar();
          },
          error: (e) => { this.procesando = false; Swal.fire('No se pudo confirmar', e?.error?.message ?? 'Error inesperado', 'error'); }
        });
      });
  }

  comprobante() {
    this.servicio.comprobante(this.detalle!.despachoId).subscribe({ next: (b) => abrirPdf(b), error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo generar el comprobante', 'error') });
  }

  /** Cancelar (despachos sin entregas) o reversar (confirmados): requiere autorización de un ADMIN. */
  async autorizada(accion: 'cancelar' | 'reversar') {
    const r = await Swal.fire({
      title: accion === 'cancelar' ? 'Cancelar despacho' : 'Reversar despacho',
      html: '<p class="small text-muted">Requiere la autorización de un administrador. Queda registrado en el historial.</p>' +
        '<input id="sw-motivo" class="swal2-input" placeholder="Motivo"><input id="sw-user" class="swal2-input" placeholder="Usuario administrador">' +
        '<input id="sw-pass" type="password" class="swal2-input" placeholder="Contraseña">',
      showCancelButton: true, confirmButtonText: 'Autorizar',
      preConfirm: () => {
        const v = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
        if (!v('sw-motivo') || !v('sw-user') || !v('sw-pass')) { Swal.showValidationMessage('Motivo, usuario y contraseña son obligatorios'); return false; }
        return { motivo: v('sw-motivo'), user: v('sw-user'), pass: v('sw-pass') };
      }
    });
    if (!r.isConfirmed || !r.value) { return; }
    const { motivo, user, pass } = r.value as { motivo: string; user: string; pass: string };
    const peticion = accion === 'cancelar' ? this.servicio.cancelar(this.detalle!.despachoId, motivo, user, pass) : this.servicio.reversar(this.detalle!.despachoId, motivo, user, pass);
    peticion.subscribe({
      next: () => { Swal.fire('Hecho', accion === 'cancelar' ? 'Despacho cancelado' : 'Despacho reversado', 'success'); this.recargar(); this.servicio.estados(this.detalle!.despachoId).subscribe((e) => this.estados = e); },
      error: (e) => Swal.fire('No autorizado', e?.error?.message ?? 'No se pudo completar la operación', 'error')
    });
  }

  private mostrar() {
    const el = document.getElementById('modalDespacho');
    if (el) { this.modalDetalle = new Modal(el); this.modalDetalle.show(); }
  }
}
