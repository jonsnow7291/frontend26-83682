import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { MedicoService } from './service/medico.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { TablaListadoComponent, Columna, Accion } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Veterinarios: listado con búsqueda y paginación, registro, edición y activación/inactivación.
 */
@Component({
  selector: 'app-medico',
  imports: [CommonModule, FormsModule, TablaListadoComponent],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {
  titulo = 'Médicos';
  items: Medico[] = [];
  especializaciones: Especializacion[] = [];
  form: Medico = {};
  titleModal = '';
  private modal: Modal | null = null;

  columnas: Columna[] = [
    { titulo: 'Documento', valor: (m: Medico) => `${m.tipoDocumento ?? ''} ${m.numeroDocumento ?? ''}` },
    { titulo: 'Nombres', valor: (m: Medico) => m.nombres },
    { titulo: 'Apellidos', valor: (m: Medico) => m.apellidos },
    { titulo: 'Teléfono', valor: (m: Medico) => m.telefono },
    { titulo: 'Registro profesional', valor: (m: Medico) => m.registroProfesional },
    { titulo: 'Especialización', valor: (m: Medico) => this.nombreEspecializacion(m.especializacionId) },
    { titulo: 'Estado', valor: (m: Medico) => m.activo === false ? 'Inactivo' : 'Activo' }
  ];

  acciones: Accion[] = [
    { texto: 'Editar', ejecutar: (m: Medico) => this.editar(m) },
    { texto: (m: Medico) => m.activo === false ? 'Activar' : 'Inactivar', clase: 'btn-outline-warning', ejecutar: (m: Medico) => this.cambiarEstado(m) }
  ];

  constructor(private readonly medicoService: MedicoService,
    private readonly especializacionService: EspecializacionService) {
    this.listar();
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => this.especializaciones = data,
      error: (error) => console.error('Error al obtener las especializaciones:', error)
    });
  }

  listar() {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.items = data,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los médicos', 'error')
    });
  }

  nuevo() {
    this.form = { tipoDocumento: 'CC' };
    this.titleModal = 'Registrar médico';
    this.abrir();
  }

  editar(m: Medico) {
    this.form = { ...m };
    this.titleModal = 'Editar médico';
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.numeroDocumento?.trim() || !f.nombres?.trim() || !f.apellidos?.trim() || !f.registroProfesional?.trim() || !f.especializacionId) {
      Swal.fire('Atención', 'Documento, nombres, apellidos, registro profesional y especialidad son obligatorios', 'warning');
      return;
    }
    const datos = { ...f } as unknown as Record<string, unknown>;
    const peticion = f.id ? this.medicoService.actualizar(datos) : this.medicoService.guardar(datos);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Médico guardado', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  cambiarEstado(m: Medico) {
    const activar = m.activo === false;
    Swal.fire({ title: `${activar ? 'Activar' : 'Inactivar'} a ${m.nombres} ${m.apellidos}?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.medicoService.cambiarEstado(m.id!, activar).subscribe({
        next: () => this.listar(),
        error: (e) => Swal.fire('No se pudo cambiar el estado', e?.error?.message ?? 'Error inesperado', 'error')
      });
    });
  }

  private abrir() {
    const el = document.getElementById('modalMedico');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }

  /** El backend solo envía el id de la especialización: se busca su nombre. */
  private nombreEspecializacion(id?: number): string {
    return this.especializaciones.find((e) => e.id === id)?.nombre ?? '';
  }
}
