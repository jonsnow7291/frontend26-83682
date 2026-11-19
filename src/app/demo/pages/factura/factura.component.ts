import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FacturaService } from './service/factura.service';
import { Factura } from 'src/app/models/factura';

/**
 * Facturación: generar factura desde atención, registrar pagos y anular.
 */
@Component({
  selector: 'app-factura',
  imports: [CommonModule, FormsModule],
  templateUrl: './factura.component.html'
})
export class FacturaComponent {
  facturas: Factura[] = [];
  atencionId = 0;
  cargando = false;
  montoPago = 0;
  facturaSeleccionada: Factura | null = null;

  constructor(private readonly facturaService: FacturaService) {
    this.listar();
  }

  listar() {
    this.facturaService.listar().subscribe({
      next: (data) => this.facturas = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar las facturas', 'error')
    });
  }

  generarDesdeAtencion() {
    if (!this.atencionId) {
      Swal.fire('Atención', 'Ingrese el ID de la atención', 'warning');
      return;
    }
    this.cargando = true;
    this.facturaService.generarDesdeAtencion(this.atencionId).subscribe({
      next: (res) => {
        this.cargando = false;
        Swal.fire('Éxito', res.message ?? 'Factura generada', 'success');
        this.listar();
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err?.error?.message ?? 'No se pudo generar la factura', 'error');
      }
    });
  }

  registrarPago() {
    if (!this.facturaSeleccionada?.id) return;
    if (!this.montoPago || this.montoPago <= 0) {
      Swal.fire('Atención', 'Ingrese un monto válido', 'warning');
      return;
    }
    this.facturaService.registrarPago(this.facturaSeleccionada.id, this.montoPago).subscribe({
      next: (res) => {
        Swal.fire('Éxito', res.message ?? 'Pago registrado', 'success');
        this.montoPago = 0;
        this.facturaSeleccionada = null;
        this.listar();
      },
      error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo registrar el pago', 'error')
    });
  }

  anular() {
    if (!this.facturaSeleccionada?.id) return;
    Swal.fire({
      title: '¿Anular factura?',
      input: 'text',
      inputLabel: 'Motivo de anulación',
      showCancelButton: true,
      confirmButtonText: 'Anular'
    }).then((r) => {
      if (r.isConfirmed) {
        this.facturaService.anular(this.facturaSeleccionada!.id, r.value ?? '').subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Factura anulada', 'success');
            this.facturaSeleccionada = null;
            this.listar();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo anular', 'error')
        });
      }
    });
  }

  descargarPDF(id: number) {
    this.facturaService.descargarPDF(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el PDF', 'error')
    });
  }

  estadoBadge(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'bg-warning';
      case 'parcial': return 'bg-info';
      case 'pagada': return 'bg-success';
      case 'anulada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}