/**
 * Tarifa por especialidad o servicio.
 */
export interface Tarifa {
    id?: number;
    especialidad?: string;
    servicio?: string;
    valorConsulta: number;
    iva: number;
    activo: boolean;
    fechaCambio?: Date;
}