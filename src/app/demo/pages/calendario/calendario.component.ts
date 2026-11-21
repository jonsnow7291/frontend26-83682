import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { AuthService } from 'src/app/services/auth.service';
import { CalendarioService } from './service/calendario.service';
import { CitaCalendario } from 'src/app/models/cita-calendario';
import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { descargarArchivo } from 'src/app/utils/descarga';

/** Texto local `aaaa-mm-ddTHH:mm:ss` (sin zona horaria) que espera el backend. */
function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
/** Texto `aaaa-mm-dd` de una fecha local. */
function dia(d: Date): string {
  return iso(d).substring(0, 10);
}

/**
 * Calendario de citas del médico autenticado con vistas día, semana y mes. Los datos salen de la
 * base de datos (`GET /cita/calendario`); desde aquí se registran, editan, reprograman, confirman,
 * atienden y cancelan citas, se consulta el historial de la mascota y se exporta a Excel.
 */
@Component({
  selector: 'app-calendario',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.component.html'
})
export class CalendarioComponent {
  /** Colores por estado de la cita (también se usan en la leyenda). */
  readonly estados = [
    { valor: 'PENDIENTE', clase: 'bg-warning text-dark' },
    { valor: 'CONFIRMADA', clase: 'bg-primary' },
    { valor: 'ATENDIDA', clase: 'bg-success' },
    { valor: 'FINALIZADA', clase: 'bg-secondary' },
    { valor: 'CANCELADA', clase: 'bg-danger' }
  ];
  readonly nombresDia = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  vista: 'dia' | 'semana' | 'mes' = 'mes';
  referencia = new Date();
  dias: Date[] = [];
  citas: CitaCalendario[] = [];
  resumen: Record<string, number> = {};
  cargando = false;
  readonly medicoId: number | null;

  // detalle / acciones
  seleccionada: CitaCalendario | null = null;
  citaCompleta: Cita | null = null;
  historial: Cita[] = [];
  nuevaFecha = '';
  duracion = 30;
  private modalDetalle: Modal | null = null;

  // alta / edición
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  formCita = { citaId: undefined as number | undefined, clienteId: null as number | null, mascotaId: null as number | null, fechaHora: '', duracionMinutos: 30, motivo: '' };
  private modalCita: Modal | null = null;

  // reporte Excel
  reporteDesde = dia(new Date());
  reporteHasta = dia(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  constructor(
    private readonly servicio: CalendarioService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly router: Router,
    authService: AuthService
  ) {
    this.medicoId = authService.obtenerUsuario()?.medicoId ?? null;
    this.clienteService.listarClientes().subscribe({ next: (c) => this.clientes = c, error: () => this.clientes = [] });
    this.cargar();
  }

  // ----- navegación -----
  cambiarVista(v: 'dia' | 'semana' | 'mes') { this.vista = v; this.cargar(); }
  hoy() { this.referencia = new Date(); this.cargar(); }
  mover(paso: number) {
    const d = new Date(this.referencia);
    if (this.vista === 'dia') { d.setDate(d.getDate() + paso); }
    else if (this.vista === 'semana') { d.setDate(d.getDate() + 7 * paso); }
    else { d.setDate(1); d.setMonth(d.getMonth() + paso); }
    this.referencia = d;
    this.cargar();
  }

  get titulo(): string {
    const opciones: Intl.DateTimeFormatOptions = this.vista === 'mes' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' };
    const base = this.referencia.toLocaleDateString('es-CO', opciones);
    return this.vista === 'semana' ? `Semana del ${this.dias[0]?.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} al ${this.dias[6]?.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}` : base;
  }

  /** Calcula los días visibles de la vista actual. */
  private calcularDias(): Date[] {
    const r = new Date(this.referencia.getFullYear(), this.referencia.getMonth(), this.referencia.getDate());
    if (this.vista === 'dia') { return [r]; }
    const lunes = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
    if (this.vista === 'semana') {
      const ini = lunes(r);
      return Array.from({ length: 7 }, (_, i) => new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i));
    }
    const primero = new Date(r.getFullYear(), r.getMonth(), 1);
    const ultimo = new Date(r.getFullYear(), r.getMonth() + 1, 0);
    const ini = lunes(primero);
    const total = Math.ceil(((ultimo.getTime() - ini.getTime()) / 86400000 + 1) / 7) * 7;
    return Array.from({ length: total }, (_, i) => new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + i));
  }

  /** Carga citas y resumen del rango visible desde el backend. */
  cargar() {
    this.dias = this.calcularDias();
    const desde = new Date(this.dias[0]);
    const hasta = new Date(this.dias[this.dias.length - 1]);
    hasta.setHours(23, 59, 59);
    this.cargando = true;
    this.servicio.calendario(iso(desde), iso(hasta), this.medicoId).subscribe({
      next: (c) => { this.citas = c; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el calendario', 'error'); }
    });
    this.servicio.resumen(iso(desde), iso(hasta), this.medicoId).subscribe({ next: (r) => this.resumen = r, error: () => this.resumen = {} });
  }

  citasDelDia(d: Date): CitaCalendario[] {
    const clave = dia(d);
    return this.citas.filter((c) => c.inicio?.startsWith(clave)).sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  claseEstado(estado: string): string {
    return this.estados.find((e) => e.valor === estado)?.clase ?? 'bg-secondary';
  }

  esOtroMes(d: Date): boolean { return this.vista === 'mes' && d.getMonth() !== this.referencia.getMonth(); }
  esHoy(d: Date): boolean { return dia(d) === dia(new Date()); }
  hora(texto: string): string { return texto?.substring(11, 16); }

  // ----- detalle y acciones -----
  abrir(c: CitaCalendario) {
    this.seleccionada = c;
    this.citaCompleta = null;
    this.historial = [];
    this.nuevaFecha = c.inicio.substring(0, 16);
    this.duracion = Math.max(15, Math.round((new Date(c.fin).getTime() - new Date(c.inicio).getTime()) / 60000)) || 30;
    this.servicio.consultar(c.id).subscribe({ next: (x) => this.citaCompleta = x, error: () => this.citaCompleta = null });
    this.mostrar('modalDetalleCita', (m) => this.modalDetalle = m);
  }

  /** `true` mientras la cita todavía se puede gestionar. */
  get editable(): boolean {
    return !!this.seleccionada && ['PENDIENTE', 'CONFIRMADA'].includes(this.seleccionada.estado);
  }

  confirmar() { this.ejecutar(this.servicio.confirmar(this.seleccionada!.id), 'Cita confirmada'); }
  atender() { this.ejecutar(this.servicio.atender(this.seleccionada!.id), 'Cita marcada como atendida'); }

  reprogramar() {
    if (!this.nuevaFecha) { Swal.fire('Atención', 'Seleccione la nueva fecha y hora', 'warning'); return; }
    this.ejecutar(this.servicio.reprogramar(this.seleccionada!.id, this.nuevaFecha.length === 16 ? this.nuevaFecha + ':00' : this.nuevaFecha, this.duracion), 'Cita reprogramada');
  }

  cancelar() {
    Swal.fire({ title: 'Cancelar cita', input: 'text', inputLabel: 'Motivo de la cancelación', showCancelButton: true, confirmButtonText: 'Cancelar cita', cancelButtonText: 'Volver',
      inputValidator: (v) => (!v?.trim() ? 'El motivo es obligatorio' : null) })
      .then((r) => { if (r.isConfirmed) { this.ejecutar(this.servicio.cancelar(this.seleccionada!.id, r.value.trim()), 'Cita cancelada (se conserva en el historial)'); } });
  }

  iniciarAtencion() {
    this.modalDetalle?.hide();
    this.router.navigate(['/inicio/atencion-medica'], { queryParams: { citaId: this.seleccionada!.id } });
  }

  verHistorialMascota() {
    const id = this.citaCompleta?.mascota?.mascotaId;
    if (!id) { return; }
    this.servicio.historialMascota(id).subscribe({ next: (h) => this.historial = h, error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el historial', 'error') });
  }

  private ejecutar(peticion: any, mensaje: string) {
    peticion.subscribe({
      next: () => { this.modalDetalle?.hide(); Swal.fire('Éxito', mensaje, 'success'); this.cargar(); },
      error: (e: any) => Swal.fire('No se pudo completar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  // ----- alta / edición -----
  nueva(fecha?: Date) {
    const base = fecha ? new Date(fecha) : new Date();
    if (fecha) { base.setHours(9, 0, 0, 0); }
    this.formCita = { citaId: undefined, clienteId: null, mascotaId: null, fechaHora: iso(base).substring(0, 16), duracionMinutos: 30, motivo: '' };
    this.mascotas = [];
    this.mostrar('modalFormCita', (m) => this.modalCita = m);
  }

  editar() {
    const c = this.citaCompleta;
    if (!c || !this.seleccionada) { return; }
    this.formCita = { citaId: c.id, clienteId: c.cliente?.clienteId ?? null, mascotaId: c.mascota?.mascotaId ?? null, fechaHora: this.seleccionada.inicio.substring(0, 16), duracionMinutos: this.duracion, motivo: c.motivo ?? '' };
    if (this.formCita.clienteId) { this.mascotaService.buscarPorCliente(this.formCita.clienteId).subscribe((m) => this.mascotas = m); }
    this.modalDetalle?.hide();
    this.mostrar('modalFormCita', (m) => this.modalCita = m);
  }

  alCambiarCliente() {
    this.formCita.mascotaId = null;
    this.mascotas = [];
    if (this.formCita.clienteId) { this.mascotaService.buscarPorCliente(this.formCita.clienteId).subscribe({ next: (m) => this.mascotas = m, error: () => this.mascotas = [] }); }
  }

  guardarCita() {
    const f = this.formCita;
    if (!this.medicoId) { Swal.fire('Atención', 'Su usuario no tiene un médico asociado', 'warning'); return; }
    if (!f.clienteId || !f.mascotaId || !f.fechaHora || !f.motivo.trim()) { Swal.fire('Atención', 'Propietario, mascota, fecha/hora y motivo son obligatorios', 'warning'); return; }
    const rq = { citaId: f.citaId, clienteId: f.clienteId, mascotaId: f.mascotaId, medicoId: this.medicoId, fechaHora: f.fechaHora.length === 16 ? f.fechaHora + ':00' : f.fechaHora, motivo: f.motivo.trim(), duracionMinutos: f.duracionMinutos };
    const peticion = f.citaId ? this.servicio.actualizar(rq) : this.servicio.guardar(rq);
    peticion.subscribe({
      next: () => { this.modalCita?.hide(); Swal.fire('Éxito', f.citaId ? 'Cita actualizada' : 'Cita registrada', 'success'); this.cargar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  // ----- reporte -----
  exportarExcel() {
    if (!this.reporteDesde || !this.reporteHasta || this.reporteDesde > this.reporteHasta) { Swal.fire('Atención', 'Seleccione un rango de fechas válido', 'warning'); return; }
    this.servicio.reporteExcel(`${this.reporteDesde}T00:00:00`, `${this.reporteHasta}T23:59:59`, this.medicoId).subscribe({
      next: (blob) => descargarArchivo(blob, `citas-${this.reporteDesde}_${this.reporteHasta}.xlsx`),
      error: () => Swal.fire('Error', 'No se pudo generar el reporte', 'error')
    });
  }

  private mostrar(id: string, guardar: (m: Modal) => void) {
    const el = document.getElementById(id);
    if (el) { const m = new Modal(el); guardar(m); m.show(); }
  }
}
