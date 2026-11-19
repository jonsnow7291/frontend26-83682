import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private api = 'inventario/carga-masiva';

  constructor(private backendService: BackendService) { }

  /**
   * Descarga la plantilla de carga masiva (CSV/XLSX).
   */
  descargarPlantilla(): Observable<Blob> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'plantilla');
  }

  /**
   * Envía el archivo para previsualizar filas válidas y con error.
   * @param file archivo seleccionado.
   */
  previsualizar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.backendService.postFile(environment.apiUrlAuth, this.api, 'previsualizar', formData);
  }

  /**
   * Confirma la importación de las filas válidas.
   * @param filas datos de filas a importar.
   */
  confirmar(filas: any[]): Observable<any> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'confirmar', filas);
  }

  /**
   * Descarga el informe de errores de una carga.
   * @param cargaId identificador de la carga.
   */
  descargarInformeErrores(cargaId: number): Observable<Blob> {
    const params = new URLSearchParams({ cargaId: cargaId.toString() });
    return this.backendService.get(environment.apiUrlAuth, this.api, 'informe-errores?' + params.toString());
  }

  /**
   * Obtiene el log de cargas realizadas.
   */
  listarLog(): Observable<any[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'log');
  }
}