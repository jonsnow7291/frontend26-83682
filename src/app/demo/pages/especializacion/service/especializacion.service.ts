import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/models/especializacion';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de especializaciones médicas (`/especializacion`).
 */
@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `especializacion`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todas las especializaciones.
   */
  listarEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }
}
