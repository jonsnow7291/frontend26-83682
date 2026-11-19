import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CargaMasivaService } from '../service/carga-masiva.service';

/**
 * Carga masiva de productos del inventario desde archivo Excel/CSV.
 */
@Component({
  selector: 'app-carga-masiva',
  imports: [],
  templateUrl: './carga-masiva.component.html'
})
export class CargaMasivaComponent {
  archivo: File | null = null;
  preview: any = null;
  cargando = false;

  constructor(private readonly cargaService: CargaMasivaService) { }

  descargarPlantilla() {
    this.cargaService.descargarPlantilla().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla-inventario.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar la plantilla', 'error')
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.archivo = input.files[0];
    }
  }

  previsualizar() {
    if (!this.archivo) {
      Swal.fire('Atención', 'Seleccione un archivo', 'warning');
      return;
    }
    this.cargando = true;
    this.cargaService.previsualizar(this.archivo).subscribe({
      next: (data) => {
        this.cargando = false;
        this.preview = data;
        Swal.fire('Éxito', 'Previsualización generada', 'success');
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err?.error?.message ?? 'Error al previsualizar', 'error');
      }
    });
  }

  confirmar() {
    if (!this.preview?.filasValidas?.length) {
      Swal.fire('Atención', 'No hay filas válidas para importar', 'warning');
      return;
    }
    this.cargaService.confirmar(this.preview.filasValidas).subscribe({
      next: (res) => {
        Swal.fire('Éxito', res.message ?? 'Importación completada', 'success');
        this.preview = null;
        this.archivo = null;
      },
      error: (err) => Swal.fire('Error', err?.error?.message ?? 'Error al importar', 'error')
    });
  }

  descargarInformeErrores() {
    if (!this.preview?.cargaId) return;
    this.cargaService.descargarInformeErrores(this.preview.cargaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'informe-errores.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el informe', 'error')
    });
  }
}