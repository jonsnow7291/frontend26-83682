import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Usuario } from 'src/app/models/usuario';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { MedicoService } from '../medico/service/medico.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { UsuarioService } from './service/usuario.service';
import { TablaListadoComponent, Columna, Accion, fechaHora } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/** Datos del formulario de usuario (la contraseña solo viaja si se escribe). */
interface UsuarioForm extends Usuario {
  password?: string;
}

/**
 * Usuarios del sistema: listado, registro, edición (correo, rol, contraseña) y activación/inactivación.
 */
@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule, TablaListadoComponent],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent {
  titulo = 'Usuarios';
  items: Usuario[] = [];
  form: UsuarioForm = {};
  /** Datos profesionales (solo se envían cuando el rol es MEDICO). */
  medico: Medico = {};
  especializaciones: Especializacion[] = [];
  private medicos: Medico[] = [];
  titleModal = '';
  readonly roles = ['ADMIN', 'SECRETARIA', 'MEDICO', 'DESPACHO_MEDICO', 'CLIENTE'];
  private modal: Modal | null = null;

  columnas: Columna[] = [
    { titulo: 'Usuario', valor: (c: Usuario) => c.username },
    { titulo: 'Correo', valor: (c: Usuario) => c.email },
    { titulo: 'Rol', valor: (c: Usuario) => c.rol },
    { titulo: 'Médico', valor: (c: Usuario) => { const m = this.medicos.find((x) => x.usuarioId === c.id); return m ? `${m.nombres} ${m.apellidos}` : ''; } },
    { titulo: 'Fecha de creación', valor: (c: Usuario) => fechaHora(c.fechaCreacion) },
    { titulo: 'Activo', valor: (c: Usuario) => c.activo ? 'Sí' : 'No' }
  ];

  acciones: Accion[] = [
    { texto: 'Editar', ejecutar: (u: Usuario) => this.editar(u) },
    { texto: (u: Usuario) => u.activo ? 'Inactivar' : 'Activar', clase: 'btn-outline-warning', ejecutar: (u: Usuario) => this.cambiarEstado(u) }
  ];

  constructor(private readonly servicio: UsuarioService,
    private readonly medicoService: MedicoService,
    private readonly especializacionService: EspecializacionService) {
    this.listar();
    this.especializacionService.listarEspecializaciones().subscribe({ next: (d) => this.especializaciones = d, error: () => undefined });
  }

  listar() {
    this.servicio.getUsuarios().subscribe({
      next: (data) => this.items = data,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los usuarios', 'error')
    });
    this.medicoService.listarMedicos().subscribe({ next: (d) => this.medicos = d, error: () => undefined });
  }

  nuevo() {
    this.form = { rol: 'SECRETARIA' };
    this.medico = { tipoDocumento: 'CC' };
    this.titleModal = 'Registrar usuario';
    this.abrir();
  }

  editar(u: Usuario) {
    this.form = { id: u.id, username: u.username, email: u.email, rol: u.rol };
    this.medico = { ...(this.medicos.find((m) => m.usuarioId === u.id) ?? { tipoDocumento: 'CC' }) };
    this.titleModal = 'Editar usuario';
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.username?.trim() && !f.id) { Swal.fire('Atención', 'El usuario es obligatorio', 'warning'); return; }
    if (!f.email?.trim() || !f.rol) { Swal.fire('Atención', 'Correo y rol son obligatorios', 'warning'); return; }
    if (!f.id && (f.password ?? '').length < 8) { Swal.fire('Atención', 'La contraseña debe tener al menos 8 caracteres', 'warning'); return; }
    if (f.id && f.password && f.password.length < 8) { Swal.fire('Atención', 'La nueva contraseña debe tener al menos 8 caracteres', 'warning'); return; }
    if (f.rol === 'MEDICO') {
      const m = this.medico;
      if (!m.numeroDocumento?.trim() || !m.nombres?.trim() || !m.apellidos?.trim() || !m.registroProfesional?.trim() || !m.especializacionId) {
        Swal.fire('Atención', 'Para un médico son obligatorios documento, nombres, apellidos, registro profesional y especialidad', 'warning');
        return;
      }
    }
    const datos = { ...f, medico: f.rol === 'MEDICO' ? this.medico : undefined } as unknown as Record<string, unknown>;
    const peticion = f.id ? this.servicio.actualizar(datos) : this.servicio.guardar(datos);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Usuario guardado', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  cambiarEstado(u: Usuario) {
    const activar = !u.activo;
    Swal.fire({ title: `${activar ? 'Activar' : 'Inactivar'} a "${u.username}"?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.servicio.cambiarEstado(u.id!, activar).subscribe({
        next: () => this.listar(),
        error: (e) => Swal.fire('No se pudo cambiar el estado', e?.error?.message ?? 'Error inesperado', 'error')
      });
    });
  }

  private abrir() {
    const el = document.getElementById('modalUsuario');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }
}
