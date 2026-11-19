/**
 * Atención médica de una cita.
 */
export interface AtencionMedica {
    id?: number;
    citaId?: number;
    mascotaNombre?: string;
    clienteNombre?: string;
    antecedentes?: string;
    motivo?: string;
    sintomas?: string;
    diagnostico?: string;
    observaciones?: string;
    recomendaciones?: string;
    fechaAtencion?: Date;
    finalizada?: boolean;
}