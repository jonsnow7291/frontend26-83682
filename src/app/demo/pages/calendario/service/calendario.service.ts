import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaCalendario } from 'src/app/models/cita-calendario';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private api = 'cita/calendario';

  constructor(private backendService: BackendService) { }

  listar(fechaInicio: string, fechaFin: string): Observable<CitaCalendario[]> {
    const params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar', params);
  }

  obtener(id: number): Observable<CitaCalendario> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', params);
  }

  guardar(cita: CitaCalendario): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', cita);
  }

  actualizar(cita: CitaCalendario): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', cita);
  }

  cancelar(id: number, motivo: string): Observable<Respuesta> {
    const params = new HttpParams().set('id', id).set('motivo', motivo);
    return this.backendService.post(environment.apiUrlAuth, this.api, 'cancelar', null, params);
  }

  reprogramar(id: number, fechaInicio: Date, fechaFin: Date): Observable<Respuesta> {
    const body = { id, fechaInicio, fechaFin };
    return this.backendService.post(environment.apiUrlAuth, this.api, 'reprogramar', body);
  }

  descargarReporteExcel(fechaInicio: string, fechaFin: string, medicoId?: number): Observable<Blob> {
    let params = new HttpParams().set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (medicoId) {
      params = params.set('medicoId', medicoId);
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'reporte-excel', params);
  }
}