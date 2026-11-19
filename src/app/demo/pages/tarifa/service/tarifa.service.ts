import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarifa } from 'src/app/models/tarifa';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private api = 'tarifa';

  constructor(private backendService: BackendService) { }

  listar(): Observable<Tarifa[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  guardar(tarifa: Tarifa): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', tarifa);
  }

  actualizar(tarifa: Tarifa): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', tarifa);
  }

  activarInactivar(id: number, activo: boolean): Observable<Respuesta> {
    const params = new URLSearchParams({ id: id.toString(), activo: activo.toString() });
    return this.backendService.post(environment.apiUrlAuth, this.api, 'activar-inactivar?' + params.toString());
  }

  listarLogCambios(): Observable<any[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'log-cambios');
  }
}