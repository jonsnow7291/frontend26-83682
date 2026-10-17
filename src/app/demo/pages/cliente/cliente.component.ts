import { Component } from '@angular/core';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';
import { TablaListadoComponent, Columna, soloFecha } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de clientes con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-cliente',
  imports: [TablaListadoComponent],
  templateUrl: './cliente.component.html'
})
export class ClienteComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Clientes';
  /**
   * Registros de clientes recibidos del backend.
   */
  items: Cliente[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Documento', valor: (c: Cliente) => `${c.tipoDocumento ?? ''} ${c.numeroDocumento ?? ''}` },
    { titulo: 'Nombres', valor: (c: Cliente) => c.nombres },
    { titulo: 'Apellidos', valor: (c: Cliente) => c.apellidos },
    { titulo: 'Nacimiento', valor: (c: Cliente) => soloFecha(c.fechaNacimiento) },
    { titulo: 'Género', valor: (c: Cliente) => c.genero },
    { titulo: 'Teléfono', valor: (c: Cliente) => c.telefono },
    { titulo: 'Dirección', valor: (c: Cliente) => c.direccion },
    { titulo: 'Activo', valor: (c: Cliente) => c.activo ? 'Sí' : 'No' }
  ];

  constructor(private readonly servicio: ClienteService) {
    this.listar();
  }

  /**
   * Consulta los clientes en el backend.
   */
  listar() {
    this.servicio.listarClientes().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener clientes:', error)
    });
  }
}
