import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servicio genérico de comunicación HTTP con el backend. Agrega los encabezados
 * comunes (JSON y token, si existe) a cada petición.
 */
@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient) { }

  /**
   * Construye los encabezados HTTP comunes, incluido el token si existe.
   * @returns encabezados de la petición.
   */
  construirHeader() {
    // Aqui obtenemos el token desde el local storage
    const tokenRecuperado = localStorage.getItem('token');
    if (tokenRecuperado != '') {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        Authorization: 'Bearer ' + tokenRecuperado,
      });
      return headers;
    } else {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      });
      return headers;
    }
  }

  /**
   * Realiza una petición GET.
   * @param urlApi   URL base del backend.
   * @param endpoint recurso (ej. `cita`).
   * @param service  operación (ej. `listar`).
   * @param routerParams parámetros de consulta (opcional).
   */
  get<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    routerParams?: HttpParams
  ) {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.get<T>(`${urlApi}/${endpoint}/${service}`, {
      params: routerParams,
      headers: headers,
    });
  }


  /**
   * Realiza una petición POST (crear).
   * @param urlApi   URL base del backend.
   * @param endpoint recurso.
   * @param service  operación.
   * @param data     cuerpo de la petición.
   * @param params   parámetros de consulta (opcional).
   */
  post<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    params?: HttpParams
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
      params: params,
    });
  }

  /**
   * Realiza una petición PUT (actualizar).
   * @param urlApi   URL base del backend.
   * @param endpoint recurso.
   * @param service  operación.
   * @param data     cuerpo de la petición.
   */
  put<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.put<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }

  /**
   * Realiza una petición PATCH (cambio parcial, ej. cancelar una cita).
   * @param urlApi   URL base del backend.
   * @param endpoint recurso.
   * @param service  operación.
   * @param data     cuerpo de la petición.
   * @param params   parámetros de consulta (opcional).
   */
  patch<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    params?: HttpParams
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.patch<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
      params: params,
    });
  }

  /**
   * Realiza una petición DELETE (eliminar).
   * @param urlApi   URL base del backend.
   * @param endpoint recurso.
   * @param service  operación.
   * @param params   parámetros de consulta (opcional).
   */
  delete<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    params?: HttpParams
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.delete<T>(`${urlApi}/${endpoint}/${service}`, {
      headers: headers,
      params: params,
    });
  }

  /**
   * Realiza una petición POST con archivos (multipart).
   * @param urlApi   URL base del backend.
   * @param endpoint recurso.
   * @param service  operación.
   * @param data     datos del formulario con archivos.
   */
  postFile<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || ''; // Evita `null`
    const headers = new HttpHeaders({
      mimeType: 'multipart/form-data',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });
    return this.http.post<T>(`${urlApi}/${endpoint}/${service}`, data, {
      headers: headers,
    });
  }
}
