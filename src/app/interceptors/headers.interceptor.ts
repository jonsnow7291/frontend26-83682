import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';


/**
 * Interceptor HTTP que agrega `Content-Type: application/json` a las peticiones con cuerpo
 * que no lo traen (excepto `FormData`).
 */
@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  /**
   * Intercepta cada petición y agrega el encabezado si hace falta.
   * @param req  petición original.
   * @param next siguiente manejador de la cadena.
   */
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (req.body === null || req.body instanceof FormData || req.headers.has('Content-Type')) {
      return next.handle(req);
    }

    return next.handle(req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }

  /**
   * Devuelve una copia de la petición con `Content-Type: application/json`.
   * @param request petición original.
   */
  addHeaders(request: HttpRequest<unknown>): HttpRequest<unknown> {
    return (request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }
}