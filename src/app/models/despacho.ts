/**
 * Despacho de una fórmula médica.
 */
export interface Despacho {
    id?: number;
    formulaId?: number;
    veterinario?: string;
    propietario?: string;
    mascota?: string;
    fecha?: Date;
    estadoDespacho: 'en_preparacion' | 'parcial' | 'despachado' | 'pendiente_disponibilidad' | 'cancelado';
    detalles: DespachoDetalle[];
}

/**
 * Detalle de despacho de medicamento.
 */
export interface DespachoDetalle {
    medicamentoNombre: string;
    cantidadRecetada: number;
    cantidadEntregada: number;
    lote?: string;
    fechaVencimiento?: Date;
}