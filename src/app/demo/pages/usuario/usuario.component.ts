import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Usuario } from 'src/app/models/usuario';
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
  titleModal = '';
  readonly roles = ['ADMIN', 'SECRETARIA', 'MEDICO', 'DESPACHO_MEDICO', 'CLIENTE'];
  private modal: Modal | null = null;

  columnas: Columna[] = [
    { titulo: 'Usuario', valor: (c: Usuario) => c.username },
    { titulo: 'Correo', valor: (c: Usuario) => c.email },
    { titulo: 'Rol', valor: (c: Usuario) => c.rol },
    { titulo: 'Fecha de creación', valor: (c: Usuario) => fechaHora(c.fechaCreacion) },
    { titulo: 'Activo', valor: (c: Usuario) => c.activo ? 'Sí' : 'No' }
  ];

  acciones: Accion[] = [
    { texto: 'Editar', ejecutar: (u: Usuario) => this.editar(u) },
    { texto: (u: Usuario) => u.activo ? 'Inactivar' : 'Activar', clase: 'btn-outline-warning', ejecutar: (u: Usuario) => this.cambiarEstado(u) }
  ];

  constructor(private readonly servicio: UsuarioService) {
    this.listar();
  }

  listar() {
    this.servicio.getUsuarios().subscribe({
      next: (data) => this.items = data,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los usuarios', 'error')
    });
  }

  nuevo() {
    this.form = { rol: 'SECRETARIA' };
    this.titleModal = 'Registrar usuario';
    this.abrir();
  }

  editar(u: Usuario) {
    this.form = { id: u.id, username: u.username, email: u.email, rol: u.rol };
    this.titleModal = 'Editar usuario';
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.username?.trim() && !f.id) { Swal.fire('Atención', 'El usuario es obligatorio', 'warning'); return; }
    if (!f.email?.trim() || !f.rol) { Swal.fire('Atención', 'Correo y rol son obligatorios', 'warning'); return; }
    if (!f.id && (f.password ?? '').length < 8) { Swal.fire('Atención', 'La contraseña debe tener al menos 8 caracteres', 'warning'); return; }
    if (f.id && f.password && f.password.length < 8) { Swal.fire('Atención', 'La nueva contraseña debe tener al menos 8 caracteres', 'warning'); return; }
    const datos = { ...f } as unknown as Record<string, unknown>;
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
