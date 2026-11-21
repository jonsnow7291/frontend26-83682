/**
 * Atención médica abierta desde una cita (respuesta de `/atencion`).
 * Estado: EN_CURSO o FINALIZADA.
 */
export interface AtencionMedica {
    id?: number;
    citaId?: number;
    medicoId?: number;
    tarifaId?: number;
    motivo?: string;
    sintomas?: string;
    diagnostico?: string;
    observaciones?: string;
    recomendaciones?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

/** Datos para abrir o registrar una atención (`AtencionRq`). */
export interface AtencionRq {
    id?: number;
    citaId: number;
    tarifaId?: number | null;
    motivo?: string;
    sintomas?: string;
    diagnostico?: string;
    observaciones?: string;
    recomendaciones?: string;
}
