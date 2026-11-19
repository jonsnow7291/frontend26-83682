import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AtencionMedicaService } from './service/atencion-medica.service';
import { AtencionMedica } from 'src/app/models/atencion-medica';

/**
 * Pantalla de atención médica abierta desde una cita.
 * Rol MEDICO y ADMIN.
 */
@Component({
  selector: 'app-atencion-medica',
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-medica.component.html'
})
export class AtencionMedicaComponent {
  atenciones: AtencionMedica[] = [];
  citaId = 0;
  form: any = {
    citaId: '', mascotaNombre: '', clienteNombre: '', antecedentes: '',
    motivo: '', sintomas: '', diagnostico: '', observaciones: '', recomendaciones: ''
  };
  modoFormulario = 'C';
  atencionSeleccionada: AtencionMedica | null = null;
  cargando = false;

  constructor(private readonly atencionService: AtencionMedicaService) { }

  buscarPorCita() {
    if (!this.citaId) {
      Swal.fire('Atención', 'Ingrese un ID de cita', 'warning');
      return;
    }
    this.atencionService.listarPorCita(this.citaId).subscribe({
      next: (data) => this.atenciones = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar las atenciones', 'error')
    });
  }

  nueva() {
    this.atencionSeleccionada = null;
    this.form = { citaId: this.citaId.toString(), mascotaNombre: '', clienteNombre: '', antecedentes: '', motivo: '', sintomas: '', diagnostico: '', observaciones: '', recomendaciones: '' };
    this.modoFormulario = 'C';
  }

  editar(a: AtencionMedica) {
    this.atencionSeleccionada = a;
    this.form = { ...a };
    this.modoFormulario = 'E';
  }

  guardar() {
    if (!this.form.diagnostico) {
      Swal.fire('Atención', 'El diagnóstico es obligatorio', 'warning');
      return;
    }
    this.cargando = true;
    const peticion = this.modoFormulario === 'E' && this.atencionSeleccionada
      ? this.atencionService.actualizar(this.form)
      : this.atencionService.guardar(this.form);
    peticion.subscribe({
      next: (res) => {
        this.cargando = false;
        Swal.fire('Éxito', res.message ?? 'Atención guardada', 'success');
        this.buscarPorCita();
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire('Error', err?.error?.message ?? 'No se pudo guardar', 'error');
      }
    });
  }

  finalizar(id: number) {
    Swal.fire({
      title: '¿Finalizar atención?',
      text: 'Se generará una prefactura PDF.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Finalizar'
    }).then((r) => {
      if (r.isConfirmed) {
        this.atencionService.finalizar(id).subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Atención finalizada', 'success');
            this.buscarPorCita();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo finalizar', 'error')
        });
      }
    });
  }

  descargarPrefactura(id: number) {
    this.atencionService.generarPrefacturaPDF(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prefactura-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo generar la prefactura', 'error')
    });
  }
}