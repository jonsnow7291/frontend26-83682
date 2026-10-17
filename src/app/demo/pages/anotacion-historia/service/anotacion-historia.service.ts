import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = `anotacion-historia`;

  constructor(private backendService: BackendService) { }

  listarAnotaciones(historiaId: number): Observable<AnotacionHistoria[]> {
    const params = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar", params);
  }

  consultarAnotacion(anotacionId: number): Observable<AnotacionHistoria> {
    const params = new HttpParams().set('anotacionId', anotacionId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  guardarAnotacion(anotacion: AnotacionHistoriaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", anotacion);
  }

  actualizarAnotacion(anotacion: AnotacionHistoriaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", anotacion);
  }
}