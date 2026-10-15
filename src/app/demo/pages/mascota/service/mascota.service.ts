import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mascota } from 'src/app/models/mascota';
import { MascotaRq } from 'src/app/models/mascota-rq';
import { Respuesta } from 'src/app/models/respuesta';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la gestión y consulta de mascotas.
 */
@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private api = `mascota`;

  constructor(private backendService: BackendService) { }

  /**
   * Obtiene la lista completa de mascotas registradas.
   */
  listarMascotas(): Observable<Mascota[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-mascotas");
  }

  /**
   * Busca las mascotas que pertenecen a un cliente específico (utilizado en combos dependientes).
   *
   * @param clienteId Identificador único del cliente.
   */
  buscarPorCliente(clienteId: number): Observable<Mascota[]> {
    const params = new HttpParams().set('clienteId', clienteId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "buscar-by-cliente", params);
  }

  /**
   * Registra una nueva mascota en el sistema.
   *
   * @param mascota Datos de la mascota a registrar.
   */
  guardarMascota(mascota: MascotaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "guardar", mascota);
  }

  /**
   * Actualiza la información de una mascota existente.
   *
   * @param mascota Datos actualizados de la mascota.
   */
  actualizarMascota(mascota: MascotaRq): Observable<Respuesta> {
    return this.backendService.post(environment.apiUrlAuth, this.api, "actualizar", mascota);
  }
}
