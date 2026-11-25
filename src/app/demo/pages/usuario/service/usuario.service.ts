import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de usuarios del sistema (`/usuario`).
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `usuario`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todos los usuarios del sistema.
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }

  /** Registra un nuevo registro (validado por el backend). */
  guardar(datos: Record<string, unknown>): Observable<Usuario> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', datos);
  }

  /** Actualiza un registro existente. */
  actualizar(datos: Record<string, unknown>): Observable<Usuario> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', datos);
  }

  /** Activa o inactiva un registro. */
  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'estado', null, new HttpParams().set('id', id).set('activo', activo));
  }

  /** Elimina un registro. */
  eliminar(id: number): Observable<Respuesta> {
    const params = new HttpParams().set('id', id);
    return this.backendService.delete(environment.apiUrlAuth, this.api, 'eliminar', null, params);
  }
}
