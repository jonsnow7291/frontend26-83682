// Angular import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { FooterComponent } from './theme/shared/components/footer/footer.component';

/**
 * Componente raíz de la aplicación.
 */
@Component({
  selector: 'app-root',
  imports: [SpinnerComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /**
   * Router de Angular, para escuchar el fin de cada navegación.
   */
  private router = inject(Router);

  /**
   * Título de la aplicación.
   */
  title = 'Clínica Veterinaria Uniminuto';

  /**
   * Al terminar cada navegación, desplaza la vista al inicio de la página.
   */
  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
