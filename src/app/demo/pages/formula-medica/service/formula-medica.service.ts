import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { FormulaMedicaRq } from 'src/app/models/formula-medica-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio de acceso a los endpoints de fórmulas médicas (`/formula-medica`).
 */
@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  private api = `formula-medica`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todas las fórmulas médicas, de la más reciente a la más antigua.
   */
  listarFormulas(): Observable<FormulaMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  /**
   * Consulta el detalle completo de una fórmula médica.
   * @param formulaId identificador de la fórmula.
   */
  consultarFormula(formulaId: number): Observable<FormulaMedica> {
    const params = new HttpParams().set('formulaId', formulaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  /**
   * Registra una nueva fórmula médica.
   * @param formula datos de la fórmula a registrar.
   */
  guardarFormula(formula: FormulaMedicaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", formula);
  }

  /**
   * Actualiza una fórmula médica existente.
   * @param formula datos actualizados de la fórmula (incluye `formulaId`).
   */
  actualizarFormula(formula: FormulaMedicaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", formula);
  }
}
