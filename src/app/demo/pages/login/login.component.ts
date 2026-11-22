import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioAuth } from 'src/app/models/usuario-auth';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Pantalla de inicio de sesión (layout guest).
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = false;
  /** Desafío OTP pendiente (no vacío = se muestra el segundo paso). */
  desafioId = '';
  correo = '';
  codigo = '';

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
    this.authService.iniciarSesion(this.username, this.password).subscribe({
      next: (rs) => {
        this.cargando = false;
        if (rs.otpRequerido) {
          this.desafioId = rs.desafioId ?? '';
          this.correo = rs.correoEnmascarado ?? '';
          this.codigo = '';
          return;
        }
        this.entrar({ ...rs.usuario!, token: rs.token });
      },
      error: (error) => {
        this.cargando = false;
        const mensaje = error?.status === 0 ? 'No se pudo conectar con el servidor' : (error?.error?.message ?? 'Usuario o contraseña incorrectos');
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /** Segundo paso: valida el código OTP recibido por correo. */
  verificar() {
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      Swal.fire('Atención', 'Ingrese el código de 6 dígitos', 'warning');
      return;
    }
    this.cargando = true;
    this.authService.verificarOtp(this.desafioId, this.codigo.trim()).subscribe({
      next: (usuario) => {
        this.cargando = false;
        this.entrar(usuario);
      },
      error: (error) => {
        this.cargando = false;
        Swal.fire('Error', error?.error?.message ?? 'Código incorrecto', 'error');
        if (error?.status === 401 && /venci|intentos/i.test(error?.error?.message ?? '')) {
          this.cancelarOtp();
        }
      }
    });
  }

  /** Vuelve al formulario de usuario y contraseña. */
  cancelarOtp() {
    this.desafioId = '';
    this.codigo = '';
    this.password = '';
  }

  private entrar(usuario: UsuarioAuth) {
    this.authService.login(usuario);
    Swal.fire('Éxito', `Bienvenido ${usuario.username}`, 'success');
    this.router.navigate(['/inicio']);
  }
}
