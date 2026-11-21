import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horario } from 'src/app/models/horario';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a los horarios de disponibilidad de los veterinarios (`/horario-veterinario`).
 */
@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private readonly api = 'horario-veterinario';

  constructor(private readonly backendService: BackendService) { }

  /** Franjas de un veterinario. @param medicoId médico. */
  listar(medicoId: number): Observable<Horario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar', new HttpParams().set('medicoId', medicoId));
  }

  /** Crea una franja (no puede cruzarse con otra activa). */
  crear(h: Horario): Observable<Horario> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', h);
  }

  /** Actualiza una franja. */
  actualizar(h: Horario): Observable<Horario> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', h);
  }

  /** Elimina una franja. */
  eliminar(id: number): Observable<void> {
    return this.backendService.delete(environment.apiUrlAuth, this.api, 'eliminar', new HttpParams().set('id', id));
  }
}
