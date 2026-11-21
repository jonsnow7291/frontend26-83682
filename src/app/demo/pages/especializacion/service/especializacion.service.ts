import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular de especialidades veterinarias (`/especializacion`). Registro, edición y
 * activación/inactivación son solo ADMIN (lo exige el backend).
 */
@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  /** Ruta base del recurso en el backend. */
  private api = `especializacion`;

  constructor(private backendService: BackendService) { }

  /** Lista todas las especialidades (activas e inactivas). */
  listarEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }

  /** Registra una especialidad. @param e nombre, código y descripción. */
  guardar(e: Especializacion): Observable<Especializacion> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', e);
  }

  /** Edita una especialidad. @param e datos con id. */
  actualizar(e: Especializacion): Observable<Especializacion> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', e);
  }

  /** Activa o inactiva (no se elimina para conservar el histórico). */
  cambiarEstado(id: number, activo: boolean): Observable<Especializacion> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'estado', null, new HttpParams().set('id', id).set('activo', activo));
  }
}
