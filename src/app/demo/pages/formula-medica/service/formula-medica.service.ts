import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DisponibilidadFormula, FormulaMedica, FormulaMedicaRq } from 'src/app/models/formula-medica';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio de fórmulas médicas (`/formula-medica`).
 */
@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  private readonly api = `formula-medica`;

  constructor(private readonly backendService: BackendService) { }

  /** Lista fórmulas, opcionalmente de una cita. */
  listarFormulas(citaId?: number | null): Observable<FormulaMedica[]> {
    let params = new HttpParams();
    if (citaId) { params = params.set('citaId', citaId); }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar', params);
  }

  /** Crea una fórmula en BORRADOR (no toca inventario). */
  guardarFormula(rq: FormulaMedicaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', rq);
  }

  /** Edita una fórmula mientras sea BORRADOR o su despacho siga pendiente. */
  actualizarFormula(rq: FormulaMedicaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', rq);
  }

  /** Confirma la fórmula (solo el médico): desde ahí queda disponible para despacho. */
  confirmar(id: number): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${id}/confirmar`, null);
  }

  /** Disponibilidad en inventario de cada medicamento de la fórmula. */
  disponibilidad(id: number): Observable<DisponibilidadFormula[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `${id}/disponibilidad`);
  }

  /** Fórmula en PDF. */
  pdf(id: number): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, `${id}/pdf`);
  }
}
