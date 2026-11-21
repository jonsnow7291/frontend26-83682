import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from './service/especializacion.service';

/**
 * Administración de especialidades veterinarias: registro, edición y activación/inactivación.
 */
@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './especializacion.component.html'
})
export class EspecializacionComponent {
  items: Especializacion[] = [];
  cargando = false;
  form: Especializacion = {};
  titleModal = '';
  private modal: Modal | null = null;

  constructor(private readonly servicio: EspecializacionService) {
    this.listar();
  }

  /** Consulta las especialidades en el backend. */
  listar() {
    this.cargando = true;
    this.servicio.listarEspecializaciones().subscribe({
      next: (data) => { this.items = data; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar las especialidades', 'error'); }
    });
  }

  nueva() { this.form = {}; this.titleModal = 'Registrar especialidad'; this.abrir(); }
  editar(e: Especializacion) { this.form = { ...e }; this.titleModal = 'Editar especialidad'; this.abrir(); }

  guardar() {
    if (!this.form.nombre?.trim()) { Swal.fire('Atención', 'El nombre es obligatorio', 'warning'); return; }
    if (!/^[A-Za-z0-9_-]{1,10}$/.test(this.form.codigoEspecializacion?.trim() ?? '')) { Swal.fire('Atención', 'El código debe tener de 1 a 10 caracteres alfanuméricos', 'warning'); return; }
    const peticion = this.form.id ? this.servicio.actualizar(this.form) : this.servicio.guardar(this.form);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Especialidad guardada', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  cambiarEstado(e: Especializacion) {
    const activar = !e.activa;
    Swal.fire({ title: `${activar ? 'Activar' : 'Inactivar'} "${e.nombre}"?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.servicio.cambiarEstado(e.id!, activar).subscribe({ next: () => this.listar(), error: (er) => Swal.fire('Error', er?.error?.message ?? 'No se pudo cambiar el estado', 'error') });
    });
  }

  private abrir() {
    const el = document.getElementById('modalEspecializacion');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }
}
