import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { UsuarioAuth } from '../models/usuario-auth';
import { environment } from '../../environments/environment';

/**
 * Servicio de autenticación y sesión de usuario.
 * Gestiona el token, el rol y el estado de inicio de sesión.
 * Mientras el backend no publique el endpoint de login, se usa un mock local.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'usuario';

  /** Subject que emite el usuario autenticado (para reactivar UI por rol). */
  private usuarioSubject = new BehaviorSubject<UsuarioAuth | null>(this.obtenerUsuarioGuardado());
  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor() { }

  /**
   * Guarda el token y los datos del usuario en localStorage y actualiza el subject.
   * @param usuario datos de sesión del usuario.
   */
  login(usuario: UsuarioAuth): void {
    localStorage.setItem(this.TOKEN_KEY, usuario.token ?? '');
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  /**
   * Limpia la sesión y redirige mentalmente al login.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.usuarioSubject.next(null);
  }

  /**
   * Indica si hay una sesión activa.
   */
  isAuthenticated(): boolean {
    return !!this.obtenerToken();
  }

  /**
   * Obtiene el token JWT almacenado.
   */
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || null;
  }

  /**
   * Obtiene el rol del usuario autenticado.
   */
  obtenerRol(): string | null {
    const usuario = this.obtenerUsuario();
    return usuario?.rol ?? null;
  }

  /**
   * Obtiene los datos completos del usuario autenticado.
   */
  obtenerUsuario(): UsuarioAuth | null {
    return this.usuarioSubject.value;
  }

  /**
   * Recupera el usuario guardado en localStorage (sin hacer peticiones).
   */
  private obtenerUsuarioGuardado(): UsuarioAuth | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  /**
   * Mock de login (pendiente de endpoint real del backend).
   * Credenciales de prueba:
   * - admin / admin123 -> ADMIN
   * - secretaria / sec123 -> SECRETARIA
   * - medico / med123 -> MEDICO
   * - despacho / desp123 -> DESPACHO_MEDICO
   * @param username usuario.
   * @param password contraseña.
   */
  mockLogin(username: string, password: string): Observable<UsuarioAuth> {
    const credenciales: Record<string, UsuarioAuth> = {
      'admin': { id: 1, username: 'admin', rol: 'ADMIN', token: 'mock-token-admin' },
      'secretaria': { id: 2, username: 'secretaria', rol: 'SECRETARIA', token: 'mock-token-secretaria' },
      'medico': { id: 3, username: 'medico', rol: 'MEDICO', token: 'mock-token-medico' },
      'despacho': { id: 4, username: 'despacho', rol: 'DESPACHO_MEDICO', token: 'mock-token-despacho' }
    };

    const clave = username.toLowerCase();
    const encontrado = credenciales[clave];

    if (encontrado && password.length > 0) {
      return of(encontrado);
    }

    // Devuelve un observable con error para que el componente lo capture.
    return new Observable<UsuarioAuth>(observer => {
      observer.error({ status: 401, error: { message: 'Usuario o contraseña incorrectos' } });
    });
  }

  /**
   * Verifica si el usuario tiene uno de los roles permitidos.
   * @param rolesRoles roles autorizados.
   */
  tieneRol(rolesPermitidos: string[]): boolean {
    const rol = this.obtenerRol();
    return rol ? rolesPermitidos.includes(rol) : false;
  }
}