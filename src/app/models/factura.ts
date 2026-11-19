/**
 * Factura generada a partir de una atención finalizada.
 */
export interface Factura {
    id?: number;
    atencionId?: number;
    clienteNombre?: string;
    mascotaNombre?: string;
    fecha?: Date;
    subtotal: number;
    iva: number;
    descuento: number;
    total: number;
    estado: 'pendiente' | 'parcial' | 'pagada' | 'anulada';
    pagado: number;
}