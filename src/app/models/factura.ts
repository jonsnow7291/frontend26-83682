/** Línea de factura con precio unitario e IVA congelados al momento de facturar. */
export interface FacturaDetalle {
    id?: number;
    tipo?: string;
    descripcion?: string;
    cantidad?: number;
    precioUnitario?: number;
    ivaPorcentaje?: number;
    subtotal?: number;
    ivaValor?: number;
}

/** Pago registrado contra una factura. */
export interface Pago {
    id?: number;
    facturaId?: number;
    valor?: number;
    metodo?: string;
    referencia?: string;
    fecha?: string;
    usuarioId?: number;
}

/** Cabecera de la factura. `estadoPago`: PENDIENTE, PARCIAL, PAGADA o ANULADA. */
export interface Factura {
    id?: number;
    numero?: string;
    citaId?: number;
    subtotal?: number;
    impuestos?: number;
    descuento?: number;
    total?: number;
    fecha?: string;
    estadoPago?: string;
    motivoAnulacion?: string;
    detalles?: FacturaDetalle[];
}

/** Respuesta del backend: factura con los datos de propietario, mascota, veterinario y saldo. */
export interface FacturaRs {
    factura: Factura;
    propietario: string;
    mascota: string;
    veterinario: string;
    especialidad: string;
    pagos: Pago[];
    totalPagado: number;
    saldo: number;
}
