/**
 * Medicamento del inventario de la clínica.
 */
export class Medicamento {
    /** Identificador del medicamento. */
    id?: number;
    /** Nombre comercial. */
    nombre?: string;
    /** Descripción. */
    descripcion?: string;
    /** Presentación (ej. Tabletas 500mg). */
    presentacion?: string;
    /** Fecha de compra del lote. */
    fechaCompra?: Date;
    /** Fecha de vencimiento del lote. */
    fechaVence?: Date;
    /** Fecha de creación del registro. */
    fechaCreacionRegistro?: Date;
    /** Fecha de la última modificación del registro. */
    fechaModificacionRegistro?: Date;
}
