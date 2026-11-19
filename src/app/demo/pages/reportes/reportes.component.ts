import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReportesService } from './service/reportes.service';

/**
 * Reportes financieros, de inventario y gestión médica con exportación PDF/Excel.
 * Solo rol ADMIN.
 */
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent {
  tipos = [
    { valor: 'financieros', nombre: 'Financieros' },
    { valor: 'inventario', nombre: 'Inventario' },
    { valor: 'gestion-medica', nombre: 'Gestión médica' }
  ];
  tipoSeleccionado = 'financieros';
  fechaInicio = '';
  fechaFin = '';
  datos: any[] = [];
  cargando = false;
  filtros: Record<string, string> = {};

  constructor(private readonly reportesService: ReportesService) { }

  obtenerReporte() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire('Atención', 'Seleccione rango de fechas', 'warning');
      return;
    }
    this.cargando = true;
    this.reportesService.obtener(this.tipoSeleccionado, this.fechaInicio, this.fechaFin, this.filtros).subscribe({
      next: (data) => {
        this.datos = data?.datos ?? data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err?.error?.message ?? 'No se pudo obtener el reporte', 'error');
      }
    });
  }

  descargarPDF() {
    this.descargar('pdf');
  }

  descargarExcel() {
    this.descargar('xlsx');
  }

  private descargar(formato: 'pdf' | 'xlsx') {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire('Atención', 'Seleccione rango de fechas', 'warning');
      return;
    }
    this.cargando = true;
    const obs = formato === 'pdf'
      ? this.reportesService.descargarPDF(this.tipoSeleccionado, this.fechaInicio, this.fechaFin, this.filtros)
      : this.reportesService.descargarExcel(this.tipoSeleccionado, this.fechaInicio, this.fechaFin, this.filtros);
    obs.subscribe({
      next: (blob) => {
        this.cargando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${this.tipoSeleccionado}-${this.fechaInicio}-a-${this.fechaFin}.${formato}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err?.error?.message ?? 'No se pudo descargar el reporte', 'error');
      }
    });
  }

  get totalColumnas(): string[] {
    return this.datos.length ? Object.keys(this.datos[0]) : [];
  }
}