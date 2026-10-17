import { Component } from '@angular/core';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from './service/especializacion.service';
import { TablaListadoComponent, Columna } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de especializaciones con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-especializacion',
  imports: [TablaListadoComponent],
  templateUrl: './especializacion.component.html'
})
export class EspecializacionComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Especializaciones';
  /**
   * Registros de especializaciones recibidos del backend.
   */
  items: Especializacion[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Código', valor: (c: Especializacion) => c.codigoEspecializacion },
    { titulo: 'Nombre', valor: (c: Especializacion) => c.nombre },
    { titulo: 'Descripción', valor: (c: Especializacion) => c.descripcion }
  ];

  constructor(private readonly servicio: EspecializacionService) {
    this.listar();
  }

  /**
   * Consulta los especializaciones en el backend.
   */
  listar() {
    this.servicio.listarEspecializaciones().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener especializaciones:', error)
    });
  }
}
