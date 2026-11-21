import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CargaLog, CargaMasivaRs, CargaMasivaService } from '../service/carga-masiva.service';
import { descargarArchivo } from 'src/app/utils/descarga';

/**
 * Carga masiva de inventario en pasos: plantilla → archivo → vista previa (filas válidas y con
 * error) → confirmación → informe de errores y log de cargas.
 */
@Component({
  selector: 'app-carga-masiva',
  imports: [CommonModule],
  templateUrl: './carga-masiva.component.html'
})
export class CargaMasivaComponent {
  archivo: File | null = null;
  vista: CargaMasivaRs | null = null;
  resultado: CargaMasivaRs | null = null;
  historial: CargaLog[] = [];
  cargando = false;

  constructor(private readonly servicio: CargaMasivaService) {
    this.cargarHistorial();
  }

  descargarPlantilla(formato: 'xlsx' | 'csv') {
    this.servicio.descargarPlantilla(formato).subscribe({
      next: (blob) => descargarArchivo(blob, `plantilla-inventario.${formato}`),
      error: () => Swal.fire('Error', 'No se pudo descargar la plantilla', 'error')
    });
  }

  onFileChange(evento: Event) {
    const input = evento.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
    this.vista = null;
    this.resultado = null;
  }

  previsualizar() {
    if (!this.archivo) { return; }
    this.cargando = true;
    this.servicio.previsualizar(this.archivo).subscribe({
      next: (rs) => { this.vista = rs; this.resultado = null; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo procesar el archivo', 'error'); }
    });
  }

  confirmar() {
    if (!this.archivo || !this.vista || this.vista.validas === 0) { return; }
    Swal.fire({
      title: 'Confirmar importación',
      text: `Se importarán ${this.vista.validas} registros válidos. Las ${this.vista.rechazadas} filas con error no se importan.`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Importar'
    }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.cargando = true;
      this.servicio.confirmar(this.archivo!).subscribe({
        next: (rs) => {
          this.cargando = false;
          this.resultado = rs;
          this.vista = null;
          Swal.fire('Importación finalizada', `${rs.validas} importados, ${rs.rechazadas} rechazados`, 'success');
          this.cargarHistorial();
        },
        error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo importar', 'error'); }
      });
    });
  }

  descargarErrores(cargaId?: number) {
    if (!cargaId) { return; }
    this.servicio.descargarInformeErrores(cargaId).subscribe({
      next: (blob) => descargarArchivo(blob, `errores-carga-${cargaId}.xlsx`),
      error: () => Swal.fire('Error', 'No se pudo descargar el informe', 'error')
    });
  }

  private cargarHistorial() {
    this.servicio.historial().subscribe({ next: (h) => this.historial = h, error: () => this.historial = [] });
  }
}
