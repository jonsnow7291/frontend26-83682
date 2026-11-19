import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Pantalla de inicio de sesión (layout guest).
 * Mientras no exista el endpoint real de login en el backend, usa un mock.
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  /**
   * Intenta iniciar sesión con las credenciales ingresadas.
   */
  ingresar() {
    if (!this.username || !this.password) {
      Swal.fire('Atención', 'Ingrese usuario y contraseña', 'warning');
      return;
    }

    this.cargando = true;
    this.authService.mockLogin(this.username, this.password).subscribe({
      next: (usuario) => {
        this.authService.login(usuario);
        this.cargando = false;
        Swal.fire('Éxito', `Bienvenido ${usuario.username}`, 'success');
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.cargando = false;
        const mensaje = error?.error?.message ?? 'Usuario o contraseña incorrectos';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }
}