/**
 * Cita tal como la entrega `GET /cita/calendario` (`CitaCalendarioRs`).
 */
export interface CitaCalendario {
    id: number;
    titulo: string;
    inicio: string;
    fin: string;
    /** PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA o FINALIZADA. */
    estado: string;
    mascota?: string;
    propietario?: string;
    motivo?: string;
    medicoId?: number;
    medico?: string;
}
