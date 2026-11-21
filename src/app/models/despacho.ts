/** Resumen de un despacho (bandeja de pendientes e historial). */
export interface DespachoResumen {
    id: number;
    formulaId: number;
    /** PENDIENTE_DESPACHO, EN_PREPARACION, DESPACHO_PARCIAL, DESPACHADO, PENDIENTE_DISPONIBILIDAD o CANCELADO. */
    estado: string;
    fecha: string;
    propietario: string;
    mascota: string;
    medico: string;
    items: number;
}

/** Lote disponible de un medicamento con su vigencia. */
export interface LoteInfo {
    loteId: number;
    numeroLote: string;
    disponible: number;
    vence: string | null;
    /** VIGENTE, PROXIMO_A_VENCER o VENCIDO. */
    vigencia: string;
}

/** Línea del despacho: medicamento formulado, entregado y existencias. */
export interface LineaDespacho {
    detalleId: number;
    medicamentoId: number;
    codigo: string;
    medicamento: string;
    solicitada: number;
    entregada: number;
    pendiente: number;
    stockVigente: number;
    lotes: LoteInfo[];
}

/** Detalle de un despacho (solo lectura de lo prescrito por el médico). */
export interface DespachoDetalle {
    despachoId: number;
    formulaId: number;
    estado: string;
    fecha: string;
    propietario: string;
    mascota: string;
    medico: string;
    indicaciones: string;
    lineas: LineaDespacho[];
}

/** Lote sugerido (FEFO) para una línea. */
export interface AsignacionLote {
    detalleId: number;
    medicamento: string;
    loteId: number;
    numeroLote: string;
    cantidad: number;
    vence: string | null;
}

/** Sugerencia automática de lotes y medicamentos sin existencias. */
export interface SugerenciaDespacho {
    despachoId: number;
    asignaciones: AsignacionLote[];
    faltantes: string[];
}

/** Salida de inventario ligada a un despacho. */
export interface MovimientoDespacho {
    movimientoId: number;
    despachoId: number;
    formulaId: number;
    tipo: string;
    cantidad: number;
    lote: string;
    fecha: string;
    usuarioId: number;
    motivo: string;
}

/** Cambio de estado del despacho con su responsable. */
export interface EstadoLog {
    id: number;
    despachoId: number;
    estadoAnterior: string;
    estadoNuevo: string;
    usuarioId: number;
    fecha: string;
    motivo: string;
}
