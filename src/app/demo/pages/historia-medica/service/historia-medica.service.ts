import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaMedicaRq } from 'src/app/models/historia-medica-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  private api = `historia-medica`;

  constructor(private backendService: BackendService) { }

  listarHistorias(fechaInicial?: string, fechaFinal?: string): Observable<HistoriaMedica[]> {
    let params = new HttpParams();
    if (fechaInicial && fechaFinal) {
      params = params.set('fechaInicial', fechaInicial).set('fechaFinal', fechaFinal);
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  consultarHistoria(historiaId: number): Observable<HistoriaMedica> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  guardarHistoria(historia: HistoriaMedicaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", historia);
  }

  actualizarHistoria(historia: HistoriaMedicaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", historia);
  }

  eliminarHistoria(historiaId: number): Observable<Respuesta> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.post(environment.apiUrlAuth, this.api, "eliminar", null, params);
  }
}