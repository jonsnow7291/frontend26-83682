/**
 * Movimiento de inventario (entrada o salida).
 */
export interface MovimientoInventario {
    id?: number;
    inventarioId?: number;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    fecha: Date;
    motivo?: string;
    usuario?: string;
}