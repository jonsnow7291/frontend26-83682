/**
 * Función que obtiene de un registro el valor usado para ordenar una columna.
 */
export type ExtractorOrden<T> = (item: T) => string | number | null | undefined;

/**
 * Estado y lógica reutilizable de un DataTable en el cliente: búsqueda por texto,
 * ordenamiento por columnas y paginación. Cada componente define qué campos se
 * buscan y cómo se ordena cada columna.
 */
export class TablaDatos<T> {
  /** Registros resultantes de aplicar búsqueda y ordenamiento (sin paginar). */
  filtrados: T[] = [];

  /** Texto de búsqueda actual. */
  terminoBusqueda = '';

  /** Página visible (inicia en 1). */
  paginaActual = 1;

  /** Registros completos recibidos del backend. */
  private items: T[] = [];

  /**
   * @param extractores        función de ordenamiento por cada clave de columna.
   * @param camposBusqueda     valores de un registro en los que se busca el texto.
   * @param columnaOrden       columna de ordenamiento inicial.
   * @param ordenAscendente    sentido del ordenamiento inicial (por defecto descendente).
   * @param registrosPorPagina cantidad de registros por página.
   */
  constructor(
    private readonly extractores: Record<string, ExtractorOrden<T>>,
    private readonly camposBusqueda: (item: T) => unknown[],
    public columnaOrden: string,
    public ordenAscendente = false,
    readonly registrosPorPagina = 10
  ) { }

  /** Total de registros recibidos, antes de filtrar. */
  get totalRegistros(): number {
    return this.items.length;
  }

  /** Registros de la página actual. */
  get paginados(): T[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Número total de páginas (mínimo 1). */
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.registrosPorPagina));
  }

  /** Números de página disponibles, para el paginador. */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /**
   * Reemplaza los registros de la tabla y vuelve a la primera página.
   * @param items registros recibidos del backend.
   */
  setItems(items: T[] | null | undefined): void {
    this.items = items ?? [];
    this.paginaActual = 1;
    this.recalcular();
  }

  /**
   * Aplica un nuevo texto de búsqueda y vuelve a la primera página.
   * @param termino texto a buscar.
   */
  buscar(termino: string): void {
    this.terminoBusqueda = termino;
    this.paginaActual = 1;
    this.recalcular();
  }

  /**
   * Ordena por la columna indicada; si ya estaba ordenada por ella, invierte el sentido.
   * Vuelve a la primera página.
   * @param columna clave de la columna.
   */
  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }
    this.paginaActual = 1;
    this.recalcular();
  }

  /**
   * Clase del ícono de ordenamiento (Font Awesome) para el encabezado de una columna.
   * @param columna clave de la columna.
   */
  iconoOrden(columna: string): string {
    if (this.columnaOrden !== columna) {
      return 'fa-sort text-muted';
    }
    return this.ordenAscendente ? 'fa-sort-up' : 'fa-sort-down';
  }

  /**
   * Cambia a la página indicada si está dentro del rango válido.
   * @param pagina número de página.
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * Recalcula los registros filtrados y ordenados.
   */
  private recalcular(): void {
    const termino = normalizarTexto(this.terminoBusqueda.trim());
    const resultado = termino
      ? this.items.filter((item) =>
        this.camposBusqueda(item).some((valor) =>
          valor != null && normalizarTexto(String(valor)).includes(termino)))
      : [...this.items];

    const extractor = this.extractores[this.columnaOrden];
    if (extractor) {
      resultado.sort((a, b) => {
        const valorA = extractor(a);
        const valorB = extractor(b);
        if (valorA === valorB) return 0;
        if (valorA == null) return 1;
        if (valorB == null) return -1;
        const comparacion = valorA > valorB ? 1 : -1;
        return this.ordenAscendente ? comparacion : -comparacion;
      });
    }
    this.filtrados = resultado;
  }
}

/**
 * Normaliza un texto para búsquedas: minúsculas y sin tildes.
 * @param texto texto a normalizar.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Convierte una fecha recibida del backend en milisegundos, para ordenar.
 * @param valor fecha en formato ISO o `Date`.
 */
export function tiempo(valor?: Date | string | null): number | null {
  return valor ? new Date(valor).getTime() : null;
}

/**
 * Concatena nombres y apellidos de una persona, en minúsculas, para ordenar.
 * @param persona objeto con nombres y apellidos.
 */
export function nombreCompleto(persona?: { nombres?: string; apellidos?: string } | null): string {
  return `${persona?.nombres ?? ''} ${persona?.apellidos ?? ''}`.trim().toLowerCase();
}

/**
 * Obtiene un mensaje comprensible a partir de un error HTTP. Si el backend no
 * respondió (status 0), informa un problema de comunicación.
 * @param error            error recibido en la suscripción.
 * @param mensajePorDefecto mensaje cuando el backend no envía uno.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mensajeError(error: any, mensajePorDefecto: string): string {
  if (error?.status === 0) {
    return 'No fue posible comunicarse con el servidor. Verifique su conexión e intente nuevamente.';
  }
  return error?.error?.message ?? mensajePorDefecto;
}

/**
 * Clase del badge de Bootstrap según el estado de una cita.
 * @param estado estado de la cita.
 */
export function badgeEstadoCita(estado?: string): string {
  switch (estado?.toLowerCase()) {
    case 'confirmada': return 'bg-primary';
    case 'programada': return 'bg-info text-dark';
    case 'atendida': return 'bg-success';
    case 'cancelada': return 'bg-danger';
    case 'pendiente': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
}
