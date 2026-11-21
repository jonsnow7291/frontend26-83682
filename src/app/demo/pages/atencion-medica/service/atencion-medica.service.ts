import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtencionMedica, AtencionRq } from 'src/app/models/atencion-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Acceso a los endpoints de atención médica (`/atencion`).
 */
@Injectable({
  providedIn: 'root'
})
export class AtencionMedicaService {
  private readonly api = 'atencion';

  constructor(private readonly backendService: BackendService) { }

  /** Abre la atención de una cita (la cita pasa a ATENDIDA). */
  abrir(rq: AtencionRq): Observable<AtencionMedica> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'abrir', rq);
  }

  /** Guarda motivo, síntomas, diagnóstico, observaciones y recomendaciones. */
  registrar(rq: AtencionRq): Observable<AtencionMedica> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'registrar', rq);
  }

  /** Finaliza la atención (exige diagnóstico) y la deja en el historial clínico. */
  finalizar(id: number): Observable<AtencionMedica> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'finalizar', null, new HttpParams().set('id', id));
  }

  /** Atenciones (antecedentes médicos) de una mascota. */
  historialMascota(mascotaId: number): Observable<AtencionMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial-mascota', new HttpParams().set('mascotaId', mascotaId));
  }

  /** Prefactura en PDF (servicios prestados y medicamentos formulados). */
  prefacturaPdf(id: number): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, `${id}/prefactura-pdf`);
  }
}
