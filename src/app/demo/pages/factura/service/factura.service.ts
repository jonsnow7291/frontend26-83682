import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura } from 'src/app/models/factura';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private api = 'factura';

  constructor(private backendService: BackendService) { }

  listar(): Observable<Factura[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  obtener(id: number): Observable<Factura> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', params);
  }

  generarDesdeAtencion(atencionId: number): Observable<Respuesta> {
    const params = new HttpParams().set('atencionId', atencionId);
    return this.backendService.post(environment.apiUrlAuth, this.api, 'generar', null, params);
  }

  registrarPago(facturaId: number, monto: number): Observable<Respuesta> {
    const body = { facturaId, monto };
    return this.backendService.post(environment.apiUrlAuth, this.api, 'pago', body);
  }

  anular(facturaId: number, motivo: string): Observable<Respuesta> {
    const body = { facturaId, motivo };
    return this.backendService.post(environment.apiUrlAuth, this.api, 'anular', body);
  }

  descargarPDF(facturaId: number): Observable<Blob> {
    const params = new HttpParams().set('id', facturaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'pdf', params);
  }
}