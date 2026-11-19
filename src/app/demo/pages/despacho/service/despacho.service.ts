import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Despacho } from 'src/app/models/despacho';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DespachoService {
  private api = 'despacho';

  constructor(private backendService: BackendService) { }

  listarPendientes(): Observable<Despacho[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'pendientes');
  }

  obtener(id: number): Observable<Despacho> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', params);
  }

  confirmarEntrega(despachoId: number, detalles: any[]): Observable<Respuesta> {
    const body = { despachoId, detalles };
    return this.backendService.post(environment.apiUrlAuth, this.api, 'confirmar', body);
  }

  cancelar(despachoId: number, motivo: string): Observable<Respuesta> {
    const body = { despachoId, motivo };
    return this.backendService.post(environment.apiUrlAuth, this.api, 'cancelar', body);
  }

  descargarComprobantePDF(despachoId: number): Observable<Blob> {
    const params = new HttpParams().set('id', despachoId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'comprobante-pdf', params);
  }

  listarHistorial(): Observable<any[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial');
  }
}