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
}
