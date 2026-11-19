import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private api = 'reportes';

  constructor(private backendService: BackendService) { }

  /**
   * Obtiene datos de un reporte en formato JSON para previsualizar.
   * @param tipo 'financieros' | 'inventario' | 'gestion-medica'
   * @param fechaInicio
   * @param fechaFin
   * @param filtros filtros adicionales.
   */
  obtener(tipo: string, fechaInicio: string, fechaFin: string, filtros?: Record<string, string>): Observable<any> {
    let params = new HttpParams().set('tipo', tipo).set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        params = params.set(k, v);
      });
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'obtener', params);
  }

  descargarPDF(tipo: string, fechaInicio: string, fechaFin: string, filtros?: Record<string, string>): Observable<Blob> {
    let params = new HttpParams().set('tipo', tipo).set('fechaInicio', fechaInicio).set('fechaFin', fechaFin).set('formato', 'pdf');
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        params = params.set(k, v);
      });
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'descargar', params);
  }

  descargarExcel(tipo: string, fechaInicio: string, fechaFin: string, filtros?: Record<string, string>): Observable<Blob> {
    let params = new HttpParams().set('tipo', tipo).set('fechaInicio', fechaInicio).set('fechaFin', fechaFin).set('formato', 'xlsx');
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        params = params.set(k, v);
      });
    }
    return this.backendService.get(environment.apiUrlAuth, this.api, 'descargar', params);
  }
}