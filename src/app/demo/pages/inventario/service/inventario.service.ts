import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from 'src/app/models/inventario';
import { Lote } from 'src/app/models/lote';
import { MovimientoInventario } from 'src/app/models/movimiento-inventario';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private api = 'inventario';

  constructor(private backendService: BackendService) { }

  listar(): Observable<Inventario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'listar');
  }

  obtener(id: number): Observable<Inventario> {
    const params = new HttpParams().set('id', id);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', params);
  }

  guardar(inventario: Inventario): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', inventario);
  }

  actualizar(inventario: Inventario): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'actualizar', inventario);
  }

  eliminar(id: number): Observable<Respuesta> {
    const params = new HttpParams().set('id', id);
    return this.backendService.post(environment.apiUrlAuth, this.api, 'eliminar', null, params);
  }

  listarLotes(inventarioId: number): Observable<Lote[]> {
    const params = new HttpParams().set('inventarioId', inventarioId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'lotes', params);
  }

  listarMovimientos(inventarioId: number): Observable<MovimientoInventario[]> {
    const params = new HttpParams().set('inventarioId', inventarioId);
    return this.backendService.get(environment.apiUrlAuth, this.api, 'movimientos', params);
  }
}