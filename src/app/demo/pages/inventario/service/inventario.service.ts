import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario, InventarioRq } from 'src/app/models/inventario';
import { Lote, LoteRq } from 'src/app/models/lote';
import { MovimientoInventario } from 'src/app/models/movimiento-inventario';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a los endpoints de inventario: `/medicamento` (catálogo) e `/inventario` (lotes y movimientos).
 */
@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  constructor(private readonly backendService: BackendService) { }

  /**
   * Lista productos con filtros.
   * @param filtro TODOS, AGOTADOS, STOCK_BAJO, PROXIMOS_A_VENCER o VENCIDOS.
   * @param tipo MEDICAMENTO o UTENSILIO (opcional).
   * @param q búsqueda por nombre o código (opcional).
   */
  listar(filtro = 'TODOS', tipo = '', q = ''): Observable<Inventario[]> {
    let params = new HttpParams().set('filtro', filtro);
    if (tipo) { params = params.set('tipo', tipo); }
    if (q) { params = params.set('q', q); }
    return this.backendService.get(environment.apiUrlAuth, 'medicamento', 'listar', params);
  }

  /** Crea un producto. @param rq datos del producto. */
  crear(rq: InventarioRq): Observable<Inventario> {
    return this.backendService.post(environment.apiUrlAuth, 'medicamento', 'guardar', rq);
  }

  /** Edita un producto. @param rq datos con id. */
  actualizar(rq: InventarioRq): Observable<Inventario> {
    return this.backendService.put(environment.apiUrlAuth, 'medicamento', 'actualizar', rq);
  }

  /** Activa o inactiva un producto. @param id producto. @param activo nuevo estado. */
  cambiarEstado(id: number, activo: boolean): Observable<Inventario> {
    const params = new HttpParams().set('id', id).set('activo', activo);
    return this.backendService.patch(environment.apiUrlAuth, 'medicamento', 'estado', null, params);
  }

  /** Lotes de un producto, el que vence primero al inicio. @param medicamentoId producto. */
  lotes(medicamentoId: number): Observable<Lote[]> {
    const params = new HttpParams().set('medicamentoId', medicamentoId);
    return this.backendService.get(environment.apiUrlAuth, 'inventario', 'lotes', params);
  }

  /** Registra la entrada de un lote (genera movimiento ENTRADA). @param rq datos del lote. */
  registrarEntrada(rq: LoteRq): Observable<Lote> {
    return this.backendService.post(environment.apiUrlAuth, 'inventario', 'entrada', rq);
  }

  /** Historial de entradas y salidas. @param medicamentoId producto (opcional: todos). */
  movimientos(medicamentoId?: number): Observable<MovimientoInventario[]> {
    let params = new HttpParams();
    if (medicamentoId) { params = params.set('medicamentoId', medicamentoId); }
    return this.backendService.get(environment.apiUrlAuth, 'inventario', 'movimientos', params);
  }
}
