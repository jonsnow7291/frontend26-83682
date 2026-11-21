import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { FacturaRs } from 'src/app/models/factura';
import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { AuthService } from 'src/app/services/auth.service';
import { FacturaService } from './service/factura.service';
import { CitaService } from '../cita/service/cita.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { abrirPdf } from 'src/app/utils/descarga';

/**
 * Facturación: historial por propietario y mascota, generación desde una cita atendida, pagos
 * parciales o totales, anulación controlada y PDF. Solo el ADMIN puede autorizar descuentos.
 */
@Component({
  selector: 'app-factura',
  imports: [CommonModule, FormsModule],
  templateUrl: './factura.component.html'
})
export class FacturaComponent {
  readonly metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
  readonly esAdmin: boolean;

  facturas: FacturaRs[] = [];
  cargando = false;
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  filtroCliente: number | null = null;
  filtroMascota: number | null = null;

  // generar
  citasFacturables: Cita[] = [];
  citaId: number | null = null;
  descuento: number | null = null;
  private modalGenerar: Modal | null = null;

  // detalle / pago
  actual: FacturaRs | null = null;
  pago = { valor: null as number | null, metodo: 'EFECTIVO', referencia: '' };
  private modalDetalle: Modal | null = null;

  constructor(
    private readonly servicio: FacturaService,
    private readonly citaService: CitaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    authService: AuthService
  ) {
    this.esAdmin = authService.tieneRol(['ADMIN']);
    this.clienteService.listarClientes().subscribe({ next: (c) => this.clientes = c, error: () => this.clientes = [] });
    this.listar();
  }

  listar() {
    this.cargando = true;
    this.servicio.listar(this.filtroCliente, this.filtroMascota).subscribe({
      next: (f) => { this.facturas = f; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar las facturas', 'error'); }
    });
  }

  alCambiarCliente() {
    this.filtroMascota = null; this.mascotas = [];
    if (this.filtroCliente) { this.mascotaService.buscarPorCliente(this.filtroCliente).subscribe({ next: (m) => this.mascotas = m, error: () => this.mascotas = [] }); }
    this.listar();
  }

  estadoClase(e?: string): string {
    return ({ PENDIENTE: 'bg-warning text-dark', PARCIAL: 'bg-info text-dark', PAGADA: 'bg-success', ANULADA: 'bg-secondary' } as Record<string, string>)[e ?? ''] ?? 'bg-secondary';
  }

  // ----- generar -----
  abrirGenerar() {
    this.citaId = null; this.descuento = null; this.citasFacturables = [];
    const desde = new Date(); desde.setDate(desde.getDate() - 90);
    const hasta = new Date(); hasta.setDate(hasta.getDate() + 1);
    const f = (d: Date) => d.toISOString().substring(0, 10) + 'T00:00:00';
    this.citaService.listarPorFecha(f(desde), f(hasta)).subscribe({
      next: (c) => this.citasFacturables = c.filter((x) => ['ATENDIDA', 'FINALIZADA'].includes(x.estado ?? '')),
      error: () => this.citasFacturables = []
    });
    this.abrir('modalGenerarFactura', (m) => this.modalGenerar = m);
  }

  generar() {
    if (!this.citaId) { Swal.fire('Atención', 'Seleccione la cita atendida a facturar', 'warning'); return; }
    this.servicio.generar(this.citaId, this.esAdmin ? this.descuento : null).subscribe({
      next: (rs) => { this.modalGenerar?.hide(); Swal.fire('Factura generada', `N.º ${rs.factura.numero} · Total ${rs.factura.total}`, 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo generar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  // ----- detalle, pagos, anulación, pdf -----
  ver(f: FacturaRs) {
    this.actual = f;
    this.pago = { valor: f.saldo > 0 ? f.saldo : null, metodo: 'EFECTIVO', referencia: '' };
    this.abrir('modalDetalleFactura', (m) => this.modalDetalle = m);
  }

  registrarPago() {
    const a = this.actual!;
    if (!this.pago.valor || this.pago.valor <= 0) { Swal.fire('Atención', 'Ingrese un valor mayor que cero', 'warning'); return; }
    if (this.pago.valor > a.saldo) { Swal.fire('Atención', `El pago no puede superar el saldo (${a.saldo})`, 'warning'); return; }
    this.servicio.registrarPago(a.factura.id!, this.pago.valor, this.pago.metodo, this.pago.referencia || null).subscribe({
      next: (rs) => { this.actual = rs; this.pago = { valor: rs.saldo > 0 ? rs.saldo : null, metodo: 'EFECTIVO', referencia: '' }; Swal.fire('Pago registrado', `Estado: ${rs.factura.estadoPago}`, 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo registrar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  anular() {
    Swal.fire({ title: 'Anular factura', input: 'text', inputLabel: 'Motivo de la anulación', showCancelButton: true, confirmButtonText: 'Anular',
      inputValidator: (v) => (!v?.trim() ? 'El motivo es obligatorio' : null) }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.servicio.anular(this.actual!.factura.id!, r.value.trim()).subscribe({
        next: (rs) => { this.actual = rs; Swal.fire('Factura anulada', 'El registro se conserva en el histórico', 'success'); this.listar(); },
        error: (e) => Swal.fire('No se pudo anular', e?.error?.message ?? 'Error inesperado', 'error')
      });
    });
  }

  pdf(f: FacturaRs) {
    this.servicio.pdf(f.factura.id!).subscribe({ next: (b) => abrirPdf(b), error: () => Swal.fire('Error', 'No se pudo generar el PDF', 'error') });
  }

  private abrir(id: string, guardar: (m: Modal) => void) {
    const el = document.getElementById(id);
    if (el) { const m = new Modal(el); guardar(m); m.show(); }
  }
}
