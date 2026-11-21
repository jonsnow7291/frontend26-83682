import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DespachoDetalle, DespachoResumen, EstadoLog, MovimientoDespacho, SugerenciaDespacho } from 'src/app/models/despacho';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a los endpoints de despacho (`/despacho`), exclusivos del perfil DESPACHO_MEDICO.
 */
@Injectable({
  providedIn: 'root'
})
export class DespachoService {
  private readonly api = 'despacho';

  constructor(private readonly backendService: BackendService) { }

  /** Fórmulas pendientes de despacho. @param q id, propietario o mascota. @param fecha aaaa-mm-dd. */
  pendientes(q?: string, fecha?: string): Observable<DespachoResumen[]> {
    let params = new HttpParams();
    if (q) { params = params.set('q', q); }
    if (fecha) { params = params.set('fecha', fecha); }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'pendientes', params);
  }

  /** Detalle del despacho de una fórmula (existencias, lotes, alertas). @param formulaId fórmula. */
  detallePorFormula(formulaId: number): Observable<DespachoDetalle> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `formula/${formulaId}`);
  }

  /** Pasa a EN_PREPARACION y sugiere lotes FEFO. @param id despacho. */
  preparar(id: number): Observable<SugerenciaDespacho> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${id}/preparar`, null);
  }

  /** Confirma la entrega (transaccional, descuenta inventario). Sin líneas entrega lo sugerido/disponible. */
  confirmar(id: number, lineas: { detalleId: number; cantidad: number }[] | null, observaciones: string): Observable<DespachoDetalle> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${id}/confirmar`, lineas ? { lineas, observaciones } : null);
  }

  /** Cancela el despacho con autorización de un ADMIN. */
  cancelar(id: number, motivo: string, autorizadorUsername: string, autorizadorPassword: string): Observable<DespachoResumen> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${id}/cancelar`, { motivo, autorizadorUsername, autorizadorPassword });
  }

  /** Reversa un despacho confirmado (devuelve stock) con autorización de un ADMIN. */
  reversar(id: number, motivo: string, autorizadorUsername: string, autorizadorPassword: string): Observable<DespachoResumen> {
    return this.backendService.post(environment.apiUrlAuth, this.api, `${id}/reversar`, { motivo, autorizadorUsername, autorizadorPassword });
  }

  /** Comprobante de despacho en PDF. */
  comprobante(id: number): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, `${id}/comprobante-pdf`);
  }

  /** Historial de despachos. */
  historial(): Observable<DespachoResumen[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial');
  }

  /** Salidas de un medicamento y su relación con despachos. */
  historialMedicamento(medicamentoId: number): Observable<MovimientoDespacho[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial-medicamento', new HttpParams().set('medicamentoId', medicamentoId));
  }

  /** Historial de cambios de estado de un despacho. */
  estados(id: number): Observable<EstadoLog[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, `${id}/estados`);
  }
}
