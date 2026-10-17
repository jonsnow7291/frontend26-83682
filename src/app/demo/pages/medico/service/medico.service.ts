import { Injectable } from '@angular/core';
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
}
