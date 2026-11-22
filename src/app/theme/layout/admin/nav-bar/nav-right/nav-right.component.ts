// angular import
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { AuthService } from 'src/app/services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Usuario autenticado (para mostrar nombre y rol). */
  readonly usuario$ = this.authService.usuario$;

  constructor() {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

  /** Cierra la sesión y vuelve a la pantalla de inicio de sesión. */
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
