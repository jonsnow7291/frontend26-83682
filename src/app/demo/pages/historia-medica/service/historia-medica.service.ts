import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaMedicaRq } from 'src/app/models/historia-medica-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio de acceso a los endpoints de historias clínicas (`/historia-medica`).
 */
@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  private api = `historia-medica`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista las historias clínicas, opcionalmente filtradas por rango de fecha de creación.
   * @param fechaInicial límite inferior en formato ISO (opcional).
   * @param fechaFinal   límite superior en formato ISO (opcional).
   */
  listarHistorias(fechaInicial?: string, fechaFinal?: string): Observable<HistoriaMedica[]> {
    let params = new HttpParams();
    if (fechaInicial && fechaFinal) {
      params = params.set('fechaInicial', fechaInicial).set('fechaFinal', fechaFinal);
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  /**
   * Consulta el detalle de una historia clínica.
   * @param historiaId identificador de la historia.
   */
  consultarHistoria(historiaId: number): Observable<HistoriaMedica> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  /**
   * Registra una nueva historia clínica.
   * @param historia datos de la historia.
   */
  guardarHistoria(historia: HistoriaMedicaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", historia);
  }

  /**
   * Actualiza una historia clínica existente.
   * @param historia datos actualizados (incluye `historiaId`).
   */
  actualizarHistoria(historia: HistoriaMedicaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", historia);
  }

  /**
   * Elimina una historia clínica que aún no tiene anotaciones.
   * @param historiaId identificador de la historia.
   */
  eliminarHistoria(historiaId: number): Observable<Respuesta> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.delete(environment.apiUrlAuth, this.api, "eliminar", params);
  }
}
