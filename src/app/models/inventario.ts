/**
 * Medicamento o producto médico del inventario (respuesta de `/medicamento`).
 */
export interface Inventario {
    id?: number;
    codigo?: string;
    nombre?: string;
    descripcion?: string;
    presentacion?: string;
    /** MEDICAMENTO (exige registro Invima) o UTENSILIO. */
    tipo?: string;
    registroInvima?: string;
    precioCompra?: number;
    precioVenta?: number;
    ivaPorcentaje?: number;
    stockActual?: number;
    stockMinimo?: number;
    fechaIngreso?: string;
    fechaProximoPedido?: string;
    activo?: boolean;
}

/**
 * Datos enviados para crear o editar un medicamento/producto (`MedicamentoRq`).
 */
export interface InventarioRq {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    presentacion?: string;
    tipo: string;
    registroInvima?: string;
    precioCompra: number;
    precioVenta: number;
    ivaPorcentaje?: number;
    stockMinimo?: number;
    fechaProximoPedido?: string | null;
    activo?: boolean;
}
