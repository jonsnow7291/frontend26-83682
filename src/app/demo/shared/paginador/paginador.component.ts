import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablaDatos } from 'src/app/utils/tabla-datos';

/**
 * Paginador reutilizable para cualquier {@link TablaDatos}: muestra el rango de
 * registros visibles y los botones de navegación entre páginas.
 */
@Component({
  selector: 'app-paginador',
  imports: [CommonModule],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3" *ngIf="tabla.filtrados.length > 0">
      <small class="text-muted">
        Mostrando {{ inicio }}–{{ fin }} de {{ tabla.filtrados.length }} registros
      </small>
      <nav aria-label="Paginación" *ngIf="tabla.totalPaginas > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="tabla.paginaActual === 1">
            <button class="page-link" type="button" (click)="tabla.cambiarPagina(tabla.paginaActual - 1)">Anterior</button>
          </li>
          <li class="page-item" *ngFor="let p of tabla.paginas" [class.active]="p === tabla.paginaActual">
            <button class="page-link" type="button" (click)="tabla.cambiarPagina(p)">{{ p }}</button>
          </li>
          <li class="page-item" [class.disabled]="tabla.paginaActual === tabla.totalPaginas">
            <button class="page-link" type="button" (click)="tabla.cambiarPagina(tabla.paginaActual + 1)">Siguiente</button>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class PaginadorComponent {
  /** Tabla cuyo estado de paginación se controla. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) tabla!: TablaDatos<any>;

  /** Posición (1-based) del primer registro visible. */
  get inicio(): number {
    return (this.tabla.paginaActual - 1) * this.tabla.registrosPorPagina + 1;
  }

  /** Posición (1-based) del último registro visible. */
  get fin(): number {
    return Math.min(this.tabla.paginaActual * this.tabla.registrosPorPagina, this.tabla.filtrados.length);
  }
}
