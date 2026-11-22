import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de razas (`/raza`).
 */
@Injectable({
  providedIn: 'root'
})
export class RazaService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `raza`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todas las razas.
   */
  listarRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }

  /** Registra una raza nueva. */
  guardar(datos: Record<string, unknown>): Observable<Raza> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', datos);
  }

  /** Actualiza una raza existente. */
  actualizar(datos: Record<string, unknown>): Observable<Raza> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', datos);
  }
}
