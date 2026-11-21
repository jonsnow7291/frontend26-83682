/**
 * Tarifa de un servicio o consulta por especialidad (respuesta de `/tarifa`).
 */
export interface Tarifa {
    id?: number;
    especializacionId?: number;
    servicio?: string;
    valor?: number;
    ivaPorcentaje?: number;
    activa?: boolean;
}

/** Datos para crear o modificar una tarifa (`TarifaRq`). */
export interface TarifaRq {
    id?: number;
    especializacionId: number;
    servicio: string;
    valor: number;
    ivaPorcentaje: number;
    activa?: boolean;
}

/** Registro del historial de cambios de una tarifa (`tarifa_log`). */
export interface TarifaLog {
    id: number;
    tarifaId: number;
    accion: string;
    valorAnterior?: number;
    valorNuevo?: number;
    ivaAnterior?: number;
    ivaNuevo?: number;
    usuarioId?: number;
    fecha: string;
}
