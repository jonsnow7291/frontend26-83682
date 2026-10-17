import { Component, Input } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';

/**
 * Definición de una columna de la tabla: título y función que extrae el valor a mostrar.
 */
export interface Columna {
  /**
   * Encabezado de la columna.
   */
  titulo: string;
  /** Función que obtiene el valor a mostrar a partir del registro. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valor: (item: any) => unknown;
}

/**
 * Formatea una fecha del backend (ISO) como yyyy-MM-dd HH:mm.
 * @param valor fecha a formatear.
 */
export function fechaHora(valor?: Date | string | null): string {
  return valor ? formatDate(valor, 'yyyy-MM-dd HH:mm', 'en-US') : '';
}

/**
 * Formatea una fecha del backend (ISO) como yyyy-MM-dd.
 * @param valor fecha a formatear.
 */
export function soloFecha(valor?: Date | string | null): string {
  return valor ? formatDate(valor, 'yyyy-MM-dd', 'en-US') : '';
}

/**
 * Tabla reutilizable con buscador y paginacion. Los filtros propios de cada modulo
 * se proyectan dentro del encabezado con el selector [filtros].
 */
@Component({
  selector: 'app-tabla-listado',
  imports: [CommonModule],
  templateUrl: './tabla-listado.component.html'
})
export class TablaListadoComponent {
  /**
   * Título de la tabla.
   */
  @Input() titulo = '';
  /**
   * Columnas a mostrar.
   */
  @Input() columnas: Columna[] = [];
  /** Registros a mostrar. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() items: any[] = [];

  /**
   * Texto de búsqueda actual.
   */
  terminoBusqueda = '';
  /**
   * Página visible.
   */
  paginaActual = 1;
  /**
   * Registros por página.
   */
  readonly registrosPorPagina = 10;

  /** Registros que cumplen con el término de búsqueda (sin acentos y sin distinguir mayúsculas). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get filtrados(): any[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.items;
    }
    return this.items.filter((item) =>
      this.columnas.some((col) =>
        this.normalizarTexto(String(col.valor(item) ?? '')).includes(termino)
      )
    );
  }

  /** Registros de la página actual. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get paginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  /**
   * Número total de páginas.
   */
  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.registrosPorPagina);
  }

  /**
   * Números de página para el paginador.
   */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /**
   * Actualiza el texto de búsqueda y vuelve a la primera página.
   * @param event evento del campo de búsqueda.
   */
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  /**
   * Cambia a la página indicada si está en rango.
   * @param pagina número de página.
   */
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * Normaliza un texto: minúsculas y sin tildes.
   * @param texto texto a normalizar.
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
