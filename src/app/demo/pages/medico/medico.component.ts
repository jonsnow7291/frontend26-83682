import { Component } from '@angular/core';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { MedicoService } from './service/medico.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { TablaListadoComponent, Columna } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Listado de veterinarios con búsqueda y paginación (usa `app-tabla-listado`).
 */
@Component({
  selector: 'app-medico',
  imports: [TablaListadoComponent],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {
  /**
   * Título mostrado en la tabla.
   */
  titulo = 'Médicos';
  /**
   * Registros de veterinarios recibidos del backend.
   */
  items: Medico[] = [];
  /**
   * Catálogo de especializaciones, para mostrar su nombre.
   */
  especializaciones: Especializacion[] = [];
  /**
   * Columnas de la tabla y cómo se obtiene el valor de cada una.
   */
  columnas: Columna[] = [
    { titulo: 'Documento', valor: (m: Medico) => `${m.tipoDocumento ?? ''} ${m.numeroDocumento ?? ''}` },
    { titulo: 'Nombres', valor: (m: Medico) => m.nombres },
    { titulo: 'Apellidos', valor: (m: Medico) => m.apellidos },
    { titulo: 'Teléfono', valor: (m: Medico) => m.telefono },
    { titulo: 'Registro profesional', valor: (m: Medico) => m.registroProfesional },
    { titulo: 'Especialización', valor: (m: Medico) => this.nombreEspecializacion(m.especializacionId) }
  ];

  constructor(private readonly medicoService: MedicoService,
    private readonly especializacionService: EspecializacionService) {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.items = data,
      error: (error) => console.error('Error al obtener los médicos:', error)
    });
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => this.especializaciones = data,
      error: (error) => console.error('Error al obtener las especializaciones:', error)
    });
  }

  /**
   * Busca el nombre de la especialización a partir de su id (el backend solo envía el id).
   * @param id identificador de la especialización.
   */
  private nombreEspecializacion(id?: number): string {
    return this.especializaciones.find((e) => e.id === id)?.nombre ?? '';
  }
}
