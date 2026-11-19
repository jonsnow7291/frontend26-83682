import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { CalendarioService } from './service/calendario.service';
import { CitaCalendario } from 'src/app/models/cita-calendario';

/**
 * Calendario de citas con vistas día, semana y mes.
 * Rol MEDICO ve sus propias citas; SECRETARIA/ADMIN ven todas.
 */
@Component({
  selector: 'app-calendario',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.component.html'
})
export class CalendarioComponent {
  citas: CitaCalendario[] = [];
  vista: 'dia' | 'semana' | 'mes' = 'mes';
  fechaSeleccionada = new Date();
  cargando = false;
  citaSeleccionada: CitaCalendario | null = null;
  rol = this.authService.obtenerRol();

  constructor(private readonly authService: AuthService, private readonly calendarioService: CalendarioService) {
    this.cargar();
  }

  cargar() {
    const inicio = new Date();
    inicio.setDate(1);
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 1);
    this.cargando = true;
    this.calendarioService.listar(this.fechaToISO(inicio), this.fechaToISO(fin)).subscribe({
      next: (data) => {
        this.citas = data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  private fechaToISO(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  colorPorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return '#ffc107';
      case 'confirmada': return '#17a2b8';
      case 'atendida': return '#28a745';
      case 'cancelada': return '#dc3545';
      case 'finalizada': return '#6c757d';
      default: return '#6c757d';
    }
  }

  verDetalle(cita: CitaCalendario) {
    this.citaSeleccionada = cita;
  }

  cambiarEstado(nuevoEstado: string) {
    if (!this.citaSeleccionada?.id) return;
    Swal.fire({
      title: '¿Cambiar estado?',
      input: nuevoEstado === 'cancelada' ? 'text' : undefined,
      inputLabel: nuevoEstado === 'cancelada' ? 'Motivo de cancelación' : '',
      showCancelButton: true,
      confirmButtonText: 'Aceptar'
    }).then((r) => {
      if (r.isConfirmed) {
        const motivo = nuevoEstado === 'cancelada' ? (r.value ?? '') : '';
        this.calendarioService.cancelar(this.citaSeleccionada!.id, motivo).subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Estado actualizado', 'success');
            this.citaSeleccionada = null;
            this.cargar();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo actualizar', 'error')
        });
      }
    });
  }

  reprogramar() {
    if (!this.citaSeleccionada?.id) return;
    Swal.fire('Función', 'Reprogramar cita (arrastre en el calendario o edite fecha/hora)', 'info');
    this.citaSeleccionada = null;
  }
}