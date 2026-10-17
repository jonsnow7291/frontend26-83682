import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio de acceso a los endpoints de anotaciones de historia clínica (`/anotacion-historia`).
 */
@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `anotacion-historia`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista las anotaciones de una historia clínica, de la más reciente a la más antigua.
   * @param historiaId identificador de la historia.
   */
  listarAnotaciones(historiaId: number): Observable<AnotacionHistoria[]> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  /**
   * Consulta el detalle de una anotación.
   * @param anotacionId identificador de la anotación.
   */
  consultarAnotacion(anotacionId: number): Observable<AnotacionHistoria> {
    const params = new HttpParams().set('anotacionId', anotacionId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  /**
   * Registra una nueva anotación en una historia clínica.
   * @param anotacion datos de la anotación.
   */
  guardarAnotacion(anotacion: AnotacionHistoriaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", anotacion);
  }

  /**
   * Actualiza una anotación existente.
   * @param anotacion datos actualizados (incluye `anotacionId`).
   */
  actualizarAnotacion(anotacion: AnotacionHistoriaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", anotacion);
  }
}
