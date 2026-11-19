/**
 * Lote de un medicamento del inventario.
 */
export interface Lote {
    id?: number;
    inventarioId?: number;
    numeroLote: string;
    cantidad: number;
    precioCompra: number;
    fechaVencimiento: Date;
}