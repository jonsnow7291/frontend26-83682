import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Fila evaluada durante la previsualización de la carga masiva. */
export interface FilaCarga {
  fila: number;
  codigo?: string;
  nombre?: string;
  valida: boolean;
  errores: string[];
}

/** Resultado de previsualizar o confirmar una carga masiva. */
export interface CargaMasivaRs {
  cargaId?: number;
  archivo: string;
  totalFilas: number;
  validas: number;
  rechazadas: number;
  filas: FilaCarga[];
}

/** Registro del historial (log) de cargas. */
export interface CargaLog {
  id: number;
  nombreArchivo: string;
  usuarioId: number;
  fecha: string;
  totalFilas: number;
  filasValidas: number;
  filasRechazadas: number;
}

/**
 * Acceso a la carga masiva de inventario (`/inventario/carga-masiva`).
 */
@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private readonly api = 'inventario';

  constructor(private readonly backendService: BackendService) { }

  /** Plantilla de ejemplo. @param formato xlsx o csv. */
  descargarPlantilla(formato: 'xlsx' | 'csv'): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, 'carga-masiva/plantilla', new HttpParams().set('formato', formato));
  }

  /** Valida el archivo sin guardar nada. @param archivo .xlsx o .csv. */
  previsualizar(archivo: File): Observable<CargaMasivaRs> {
    return this.backendService.postFile(environment.apiUrlAuth, this.api, 'carga-masiva/previsualizar', this.formData(archivo));
  }

  /** Importa solo las filas válidas (el backend revalida el archivo). @param archivo mismo archivo previsualizado. */
  confirmar(archivo: File): Observable<CargaMasivaRs> {
    return this.backendService.postFile(environment.apiUrlAuth, this.api, 'carga-masiva/confirmar', this.formData(archivo));
  }

  /** Informe de errores de una carga confirmada (.xlsx). @param cargaId carga. */
  descargarInformeErrores(cargaId: number): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, this.api, `carga-masiva/${cargaId}/errores`);
  }

  /** Historial de cargas (usuario, fecha y totales). */
  historial(): Observable<CargaLog[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, 'carga-masiva');
  }

  private formData(archivo: File): FormData {
    const fd = new FormData();
    fd.append('archivo', archivo);
    return fd;
  }
}
