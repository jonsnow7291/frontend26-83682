import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UsuarioAuth } from '../models/usuario-auth';
import { environment } from '../../environments/environment';

/** Respuesta de `POST /auth/login`: sesión completa o desafío OTP pendiente. */
export interface RespuestaLogin {
  token?: string;
  usuario?: UsuarioAuth;
  otpRequerido?: boolean;
  desafioId?: string;
  correoEnmascarado?: string;
}

/**
 * Servicio de autenticación y sesión de usuario.
 * Gestiona el token, el rol y el estado de inicio de sesión.
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

  constructor(private readonly http: HttpClient) { }

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
   * Inicia sesión contra el backend (`POST /auth/login`) y devuelve los datos de sesión.
   * Credenciales de prueba por rol: ver la documentación técnica (contraseña de prueba, no real).
   * @param username usuario.
   * @param password contraseña.
   */
  iniciarSesion(username: string, password: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${environment.apiUrlAuth}/auth/login`, { username, password });
  }

  /**
   * Segundo paso del login (usuarios con OTP): valida el código recibido por correo.
   * @param desafioId identificador devuelto por el login.
   * @param codigo código de 6 dígitos.
   */
  verificarOtp(desafioId: string, codigo: string): Observable<UsuarioAuth> {
    return this.http
      .post<RespuestaLogin>(`${environment.apiUrlAuth}/auth/verificar-otp`, { desafioId, codigo })
      .pipe(map((rs) => ({ ...rs.usuario!, token: rs.token })));
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