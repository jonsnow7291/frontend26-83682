import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacturaRs } from 'src/app/models/factura';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a facturación (`/factura`) y pagos (`/pago`).
 */
@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  constructor(private readonly backendService: BackendService) { }

  /** Facturas, opcionalmente por propietario o por mascota (historial de facturación). */
  listar(clienteId?: number | null, mascotaId?: number | null): Observable<FacturaRs[]> {
    let params = new HttpParams();
    if (clienteId) { params = params.set('clienteId', clienteId); }
    if (mascotaId) { params = params.set('mascotaId', mascotaId); }
    return this.backendService.get(environment.apiUrlAuth, 'factura', 'listar', params);
  }

  /** Genera la factura de una cita atendida (descuento solo ADMIN). */
  generar(citaId: number, descuento: number | null): Observable<FacturaRs> {
    return this.backendService.post(environment.apiUrlAuth, 'factura', 'generar', { citaId, descuento });
  }

  /** Anula la factura con motivo (no se borra; exige que no tenga pagos). */
  anular(id: number, motivo: string): Observable<FacturaRs> {
    return this.backendService.patch(environment.apiUrlAuth, 'factura', 'anular', null, new HttpParams().set('id', id).set('motivo', motivo));
  }

  /** Registra un pago parcial o total. */
  registrarPago(facturaId: number, valor: number, metodo: string, referencia: string | null): Observable<FacturaRs> {
    return this.backendService.post(environment.apiUrlAuth, 'pago', 'registrar', { facturaId, valor, metodo, referencia });
  }

  /** Factura en PDF. */
  pdf(id: number): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, 'factura', `${id}/pdf`);
  }
}
