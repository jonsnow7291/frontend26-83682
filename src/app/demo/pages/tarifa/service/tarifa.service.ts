import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarifa, TarifaLog, TarifaRq } from 'src/app/models/tarifa';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a los endpoints de tarifas (`/tarifa`). Escritura solo ADMIN (lo exige el backend).
 */
@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private readonly api = 'tarifa';

  constructor(private readonly backendService: BackendService) { }

  /** Lista tarifas. @param especializacionId filtro opcional. @param todas incluir inactivas. */
  listar(especializacionId?: number | null, todas = false): Observable<Tarifa[]> {
    let params = new HttpParams().set('todas', todas);
    if (especializacionId) { params = params.set('especializacionId', especializacionId); }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar', params);
  }

  /** Crea una tarifa. */
  crear(rq: TarifaRq): Observable<Tarifa> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', rq);
  }

  /** Modifica una tarifa (queda registrada en el log; no altera facturas emitidas). */
  actualizar(rq: TarifaRq): Observable<Tarifa> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', rq);
  }

  /** Activa o inactiva una tarifa. */
  cambiarEstado(id: number, activa: boolean): Observable<Tarifa> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'estado', null, new HttpParams().set('id', id).set('activa', activa));
  }

  /** Historial de cambios de una tarifa. */
  historial(id: number): Observable<TarifaLog[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial', new HttpParams().set('id', id));
  }
}
