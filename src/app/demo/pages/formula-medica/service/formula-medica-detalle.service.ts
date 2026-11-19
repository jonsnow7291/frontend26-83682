import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaMedicaDetalle } from 'src/app/models/formula-medica-detalle';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaDetalleService {
  private api = 'formula-medica';

  constructor(private backendService: BackendService) { }

  listar(): Observable<FormulaMedicaDetalle[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  guardar(detalle: FormulaMedicaDetalle): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', detalle);
  }

  generarPDF(formulaId: number): Observable<Blob> {
    const params = new HttpParams().set('formulaId', formulaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'pdf', params);
  }
}