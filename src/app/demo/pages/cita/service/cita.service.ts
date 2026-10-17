import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Solicitud de creación o actualización de cita médica para el backend.
 */
export interface CitaRq {
  citaId?: number;
  clienteId: number;
  mascotaId: number;
  medicoId: number;
  fechaHora: string;
  estado: string;
  motivo?: string;
}

/**
 * Servicio Angular para la gestión integral de citas médicas.
 */
@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private api = `cita`;

  constructor(private backendService: BackendService) { }

  /**
   * Obtiene la lista de citas filtradas por rango de fechas opcional.
   * Si no se proporcionan fechas, retorna todas las citas ordenadas descendentemente.
   *
   * @param fechaInicial Límite inferior en formato ISO (opcional).
   * @param fechaFinal Límite superior en formato ISO (opcional).
   */
  listarPorFecha(fechaInicial?: string, fechaFinal?: string): Observable<Cita[]> {
    let params: HttpParams | undefined;
    if (fechaInicial && fechaFinal) {
      params = new HttpParams()
        .set('fechaInicial', fechaInicial)
        .set('fechaFinal', fechaFinal);
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-por-fecha", params);
  }

  /**
   * Consulta el detalle de una cita por su identificador.
   *
   * @param citaId Identificador único de la cita.
   */
  consultarCita(citaId: number): Observable<Cita> {
    const params = new HttpParams().set('citaId', citaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }

  /**
   * Lista las citas atendidas de una mascota (combo dependiente de historias y fórmulas).
   *
   * @param mascotaId Identificador de la mascota.
   */
  listarAtendidasPorMascota(mascotaId: number): Observable<Cita[]> {
    const params = new HttpParams().set('mascotaId', mascotaId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-atendidas-por-mascota", params);
  }

  /**
   * Registra una nueva cita médica en el sistema.
   *
   * @param citaRq Datos de la cita a registrar.
   */
  guardarCita(citaRq: CitaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", citaRq);
  }

  /**
   * Actualiza los datos de una cita existente.
   *
   * @param citaRq Datos actualizados de la cita.
   */
  actualizarCita(citaRq: CitaRq): Observable<Respuesta> {
    return this.backendService.put(environment.apiUrlAuth, this.api, "actualizar", citaRq);
  }

  /**
   * Cancela una cita de forma explícita.
   *
   * @param citaId Identificador de la cita a cancelar.
   */
  cancelarCita(citaId: number): Observable<Respuesta> {
    const params = new HttpParams().set('citaId', citaId);
    return this.backendService.patch(environment.apiUrlAuth, this.api, "cancelar", null, params);
  }
}
