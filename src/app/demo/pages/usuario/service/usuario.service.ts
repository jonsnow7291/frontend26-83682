import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
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
}
