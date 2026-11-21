/**
 * Movimiento de inventario (ENTRADA o SALIDA) con su trazabilidad.
 */
export interface MovimientoInventario {
    id?: number;
    medicamentoId?: number;
    loteId?: number;
    tipo?: string;
    cantidad?: number;
    fecha?: string;
    usuarioId?: number;
    formulaMedicaId?: number;
    despachoId?: number;
    motivo?: string;
}
