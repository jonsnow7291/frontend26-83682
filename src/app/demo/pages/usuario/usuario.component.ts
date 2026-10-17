import { Component } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from './service/usuario.service';
import { TablaListadoComponent, Columna, fechaHora } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de usuarios con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-usuario',
  imports: [TablaListadoComponent],
  templateUrl: './usuario.component.html'
})
export class UsuarioComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Usuarios';
  /**
   * Registros de usuarios recibidos del backend.
   */
  items: Usuario[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Usuario', valor: (c: Usuario) => c.username },
    { titulo: 'Correo', valor: (c: Usuario) => c.email },
    { titulo: 'Rol', valor: (c: Usuario) => c.rol },
    { titulo: 'Fecha de creación', valor: (c: Usuario) => fechaHora(c.fechaCreacion) },
    { titulo: 'Activo', valor: (c: Usuario) => c.activo ? 'Sí' : 'No' }
  ];

  constructor(private readonly servicio: UsuarioService) {
    this.listar();
  }

  /**
   * Consulta los usuarios en el backend.
   */
  listar() {
    this.servicio.getUsuarios().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener usuarios:', error)
    });
  }
}
