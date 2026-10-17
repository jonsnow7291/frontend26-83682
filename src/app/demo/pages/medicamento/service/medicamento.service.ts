import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/**
 * Servicio Angular para la consulta de medicamentos del inventario (`/medicamento`).
 */
@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  /**
   * Ruta base del recurso en el backend.
   */
  private api = `medicamento`;

  constructor(private backendService: BackendService) { }

  /**
   * Lista todos los medicamentos del inventario.
   */
  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar-todos");
  }
}
