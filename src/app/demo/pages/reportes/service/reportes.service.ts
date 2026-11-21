import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

/** Datos de un reporte (`ReporteData`): encabezado, columnas, filas y totales. */
export interface ReporteData {
  codigo: string;
  titulo: string;
  desde: string;
  hasta: string;
  generado: string;
  columnas: string[];
  filas: unknown[][];
  totales: Record<string, unknown>;
}

/** Filtros aceptados por los reportes. */
export interface FiltrosReporte {
  desde?: string;
  hasta?: string;
  medicoId?: number | null;
  especializacionId?: number | null;
  medicamentoId?: number | null;
  agrupacion?: string;
}

/**
 * Acceso a los reportes administrativos y contables (`/reportes/{tipo}`), solo ADMIN.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  constructor(private readonly backendService: BackendService) { }

  /** Previsualiza el reporte (JSON) antes de exportar. */
  previsualizar(tipo: string, f: FiltrosReporte): Observable<ReporteData> {
    return this.backendService.get(environment.apiUrlAuth, 'reportes', tipo, this.params(f, 'json'));
  }

  /** Descarga el reporte en PDF o Excel. */
  exportar(tipo: string, f: FiltrosReporte, formato: 'pdf' | 'xlsx'): Observable<Blob> {
    return this.backendService.getBlob(environment.apiUrlAuth, 'reportes', tipo, this.params(f, formato));
  }

  private params(f: FiltrosReporte, formato: string): HttpParams {
    let p = new HttpParams().set('formato', formato);
    if (f.desde) { p = p.set('desde', f.desde); }
    if (f.hasta) { p = p.set('hasta', f.hasta); }
    if (f.medicoId) { p = p.set('medicoId', f.medicoId); }
    if (f.especializacionId) { p = p.set('especializacionId', f.especializacionId); }
    if (f.medicamentoId) { p = p.set('medicamentoId', f.medicamentoId); }
    if (f.agrupacion) { p = p.set('agrupacion', f.agrupacion); }
    return p;
  }
}
