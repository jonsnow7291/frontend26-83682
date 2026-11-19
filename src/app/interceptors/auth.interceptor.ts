import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de autenticación.
 * - Agrega el token JWT a cada petición.
 * - Maneja 401 (redirige al login) y 403 (redirige a sin-permiso).
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  /**
   * Intercepta cada petición HTTP.
   * @param req petición original.
   * @param next siguiente manejador.
   */
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.obtenerToken();

    let request = req;
    if (token) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Sesión expirada o token inválido
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { sesion: 'expirada' } });
        } else if (error.status === 403) {
          // Acceso denegado
          this.router.navigate(['/sin-permiso']);
        }
        return throwError(() => error);
      })
    );
  }
}