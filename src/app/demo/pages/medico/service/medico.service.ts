import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de veterinarios (`/medico`).
 */
@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `medico`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todos los veterinarios.
   */
  listarMedicos(): Observable<Medico[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }

  /** Registra un nuevo registro (validado por el backend). */
  guardar(datos: Record<string, unknown>): Observable<Medico> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', datos);
  }

  /** Actualiza un registro existente. */
  actualizar(datos: Record<string, unknown>): Observable<Medico> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', datos);
  }

  /** Activa o inactiva un registro. */
  cambiarEstado(id: number, activo: boolean): Observable<Medico> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'estado', null, new HttpParams().set('id', id).set('activo', activo));
  }
}
