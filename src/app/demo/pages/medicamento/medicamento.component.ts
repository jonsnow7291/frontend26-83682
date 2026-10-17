import { Component } from '@angular/core';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';
import { TablaListadoComponent, Columna, soloFecha } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de medicamentos con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-medicamento',
  imports: [TablaListadoComponent],
  templateUrl: './medicamento.component.html'
})
export class MedicamentoComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Medicamentos';
  /**
   * Registros de medicamentos recibidos del backend.
   */
  items: Medicamento[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Nombre', valor: (c: Medicamento) => c.nombre },
    { titulo: 'Presentación', valor: (c: Medicamento) => c.presentacion },
    { titulo: 'Descripción', valor: (c: Medicamento) => c.descripcion },
    { titulo: 'Fecha de compra', valor: (c: Medicamento) => soloFecha(c.fechaCompra) },
    { titulo: 'Fecha de vencimiento', valor: (c: Medicamento) => soloFecha(c.fechaVence) }
  ];

  constructor(private readonly servicio: MedicamentoService) {
    this.listar();
  }

  /**
   * Consulta los medicamentos en el backend.
   */
  listar() {
    this.servicio.listarMedicamentos().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener medicamentos:', error)
    });
  }
}
