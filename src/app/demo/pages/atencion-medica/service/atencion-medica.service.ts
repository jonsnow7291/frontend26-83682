import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtencionMedica } from 'src/app/models/atencion-medica';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtencionMedicaService {
  private api = 'atencion-medica';

  constructor(private backendService: BackendService) { }

  listarPorCita(citaId: number): Observable<AtencionMedica[]> {
    const params = new HttpParams().set('citaId', citaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar-por-cita', params);
  }

  obtener(id: number): Observable<AtencionMedica> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', params);
  }

  guardar(atencion: AtencionMedica): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', atencion);
  }

  actualizar(atencion: AtencionMedica): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', atencion);
  }

  finalizar(id: number): Observable<Respuesta> {
    const params = new HttpParams().set('id', id);
    return this.backendService.post(environment.apiUrlAuth, this.api, 'finalizar', null, params);
  }

  generarPrefacturaPDF(id: number): Observable<Blob> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'prefactura-pdf', params);
  }
}