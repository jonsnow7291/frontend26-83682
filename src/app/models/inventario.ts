/**
 * Modelo de un producto del inventario (medicamento o utensilio).
 */
export interface Inventario {
    id?: number;
    nombre: string;
    descripcion?: string;
    presentacion?: string;
    codigo: string; // 8 caracteres
    tipo: 'medicamento' | 'utensilio';
    registroInvima?: string; // Obligatorio si es medicamento
    precioCompra: number;
    precioVenta: number;
    stockActual: number;
    stockMinimo: number;
    fechaIngreso?: Date;
    fechaProximoPedido?: Date;
    estado?: 'disponible' | 'stock_bajo' | 'agotado' | 'proximo_a_vencer' | 'vencido';
}