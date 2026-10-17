import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de clientes.
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `cliente`;

  constructor(private backendService: BackendService) { }

  /**
   * Obtiene la lista completa de clientes registrados.
   */
  listarClientes(): Observable<Cliente[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }

  /**
   * Consulta un cliente específico por su identificador.
   *
   * @param clienteId Identificador del cliente.
   */
  consultarCliente(clienteId: number): Observable<Cliente> {
    const params = new HttpParams().set('clienteId', clienteId);
    return this.backendService.get(environment.apiUrlAuth, this.api, "consultar", params);
  }
}
