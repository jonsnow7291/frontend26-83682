import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DespachoService } from './service/despacho.service';
import { Despacho } from 'src/app/models/despacho';

/**
 * Despacho de medicamentos (solo rol DESPACHO_MEDICO y ADMIN).
 */
@Component({
  selector: 'app-despacho',
  imports: [CommonModule],
  templateUrl: './despacho.component.html'
})
export class DespachoComponent {
  despachos: Despacho[] = [];
  despachoSeleccionado: Despacho | null = null;
  cargando = false;

  constructor(private readonly despachoService: DespachoService) {
    this.listar();
  }

  listar() {
    this.despachoService.listarPendientes().subscribe({
      next: (data) => this.despachos = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los despachos', 'error')
    });
  }

  verDetalle(d: Despacho) {
    this.despachoSeleccionado = d;
  }

  confirmarEntrega() {
    if (!this.despachoSeleccionado?.id) return;
    Swal.fire({
      title: '¿Confirmar entrega?',
      text: 'Se marcará el despacho como entregado.',
      showCancelButton: true,
      confirmButtonText: 'Confirmar'
    }).then((r) => {
      if (r.isConfirmed) {
        const detalles = this.despachoSeleccionado.detalles.map(det => ({
          medicamentoNombre: det.medicamentoNombre,
          cantidadEntregada: det.cantidadEntregada
        }));
        this.despachoService.confirmarEntrega(this.despachoSeleccionado!.id, detalles).subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Entrega confirmada', 'success');
            this.despachoSeleccionado = null;
            this.listar();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo confirmar', 'error')
        });
      }
    });
  }

  cancelar() {
    if (!this.despachoSeleccionado?.id) return;
    Swal.fire({
      title: '¿Cancelar despacho?',
      input: 'text',
      inputLabel: 'Motivo de cancelación',
      showCancelButton: true,
      confirmButtonText: 'Cancelar'
    }).then((r) => {
      if (r.isConfirmed) {
        this.despachoService.cancelar(this.despachoSeleccionado!.id, r.value ?? '').subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Despacho cancelado', 'success');
            this.despachoSeleccionado = null;
            this.listar();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo cancelar', 'error')
        });
      }
    });
  }

  descargarComprobante(id: number) {
    this.despachoService.descargarComprobantePDF(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante-despacho-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el comprobante', 'error')
    });
  }

  estadoBadge(estado: string): string {
    switch (estado) {
      case 'en_preparacion': return 'bg-info';
      case 'parcial': return 'bg-warning';
      case 'despachado': return 'bg-success';
      case 'pendiente_disponibilidad': return 'bg-secondary';
      case 'cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}