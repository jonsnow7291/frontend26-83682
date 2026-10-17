import { Component } from '@angular/core';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';
import { TablaListadoComponent, Columna, fechaHora } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de razas con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-raza',
  imports: [TablaListadoComponent],
  templateUrl: './raza.component.html'
})
export class RazaComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Razas';
  /**
   * Registros de razas recibidos del backend.
   */
  items: Raza[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Nombre', valor: (c: Raza) => c.nombre },
    { titulo: 'Especie', valor: (c: Raza) => c.especie },
    { titulo: 'Fecha de creación', valor: (c: Raza) => fechaHora(c.fechaCreacion) }
  ];

  constructor(private readonly servicio: RazaService) {
    this.listar();
  }

  /**
   * Consulta los razas en el backend.
   */
  listar() {
    this.servicio.listarRazas().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener razas:', error)
    });
  }
}
