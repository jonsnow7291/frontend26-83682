import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autorización por rol: permite acceder si el usuario tiene alguno de los roles permitidos.
 * Se declara en las rutas con `data: { roles: ['ADMIN', 'SECRETARIA'] }`.
 */
@Injectable({
  providedIn: 'root'
})
export class RolGuard implements CanActivate {

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  /**
   * Decide si se puede activar la ruta según el rol del usuario.
   * @param route ruta activada (contiene `data.roles`).
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolesPermitidos: string[] = route.data?.['roles'] ?? [];
    if (this.authService.tieneRol(rolesPermitidos)) {
      return true;
    }
    this.router.navigate(['/sin-permiso']);
    return false;
  }
}