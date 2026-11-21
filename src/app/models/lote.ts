/**
 * Lote de un medicamento con su cantidad disponible y vencimiento (puede ser nulo en utensilios).
 */
export interface Lote {
    id?: number;
    medicamentoId?: number;
    numeroLote?: string;
    cantidadInicial?: number;
    cantidadDisponible?: number;
    precioCompra?: number;
    fechaCompra?: string;
    fechaVencimiento?: string | null;
}

/**
 * Datos para registrar la entrada de un lote (`LoteRq`).
 */
export interface LoteRq {
    medicamentoId: number;
    numeroLote: string;
    cantidad: number;
    precioCompra?: number | null;
    fechaCompra: string;
    fechaVencimiento?: string | null;
}
