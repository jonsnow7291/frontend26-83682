import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

/**
 * Pantalla mostrada cuando el usuario no tiene permiso para acceder a una ruta.
 */
@Component({
  selector: 'app-sin-permiso',
  imports: [],
  templateUrl: './sin-permiso.component.html'
})
export class SinPermisoComponent {

  constructor(private readonly router: Router) { }

  /**
   * Vuelve al inicio.
   */
  volverInicio() {
    this.router.navigate(['/inicio']);
  }
}