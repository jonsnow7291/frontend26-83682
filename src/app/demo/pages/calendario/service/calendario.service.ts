import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaCalendario } from 'src/app/models/cita-calendario';
import { Cita } from 'src/app/models/cita';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Datos para registrar o editar una cita (`CitaRq`). */
export interface CitaRq {
  citaId?: number;
  clienteId: number;
  mascotaId: number;
  medicoId: number;
  fechaHora: string;
  motivo: string;
  duracionMinutos?: number;
}

/**
 * Acceso a los endpoints de citas usados por el calendario del médico (`/cita`).
 */
@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly api = 'cita';

  constructor(private readonly backendService: BackendService) { }

  /** Citas del rango para el calendario. @param desde ISO date-time. @param hasta ISO date-time. @param medicoId médico. */
  calendario(desde: string, hasta: string, medicoId?: number | null): Observable<CitaCalendario[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'calendario', this.rango(desde, hasta, medicoId));
  }

  /** Resumen de citas por estado del rango. */
  resumen(desde: string, hasta: string, medicoId?: number | null): Observable<Record<string, number>> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'resumen', this.rango(desde, hasta, medicoId));
  }

  /** Reporte Excel (.xlsx) de las citas del médico con filtro de fechas. */
  reporteExcel(desde: string, hasta: string, medicoId?: number | null): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, 'reporte-excel', this.rango(desde, hasta, medicoId));
  }

  /** Cita completa (con propietario y mascota). @param citaId cita. */
  consultar(citaId: number): Observable<Cita> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'consultar', new HttpParams().set('citaId', citaId));
  }

  /** Historial de citas de una mascota. @param mascotaId mascota. */
  historialMascota(mascotaId: number): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'historial-mascota', new HttpParams().set('mascotaId', mascotaId));
  }

  /** Registra una cita. */
  guardar(rq: CitaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', rq);
  }

  /** Edita una cita. */
  actualizar(rq: CitaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', rq);
  }

  /** Reprograma una cita (nueva fecha/hora). */
  reprogramar(citaId: number, fechaHora: string, duracionMinutos?: number): Observable<Respuesta> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'reprogramar', { citaId, fechaHora, duracionMinutos });
  }

  /** Confirma una cita pendiente. */
  confirmar(citaId: number): Observable<Respuesta> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'confirmar', null, new HttpParams().set('citaId', citaId));
  }

  /** Marca la cita como atendida. */
  atender(citaId: number): Observable<Respuesta> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'atender', null, new HttpParams().set('citaId', citaId));
  }

  /** Cancela la cita conservando su historial. */
  cancelar(citaId: number, motivo: string): Observable<Respuesta> {
    return this.backendService.patch(environment.apiUrlAuth, this.api, 'cancelar', null, new HttpParams().set('citaId', citaId).set('motivo', motivo));
  }

  private rango(desde: string, hasta: string, medicoId?: number | null): HttpParams {
    let p = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (medicoId) { p = p.set('medicoId', medicoId); }
    return p;
  }
}
