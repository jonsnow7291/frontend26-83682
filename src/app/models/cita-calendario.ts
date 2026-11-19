/**
 * Cita para mostrar en el calendario.
 */
export interface CitaCalendario {
    id?: number;
    title: string;
    start: Date;
    end?: Date;
    estado: 'pendiente' | 'confirmada' | 'atendida' | 'cancelada' | 'finalizada';
    cliente?: string;
    mascota?: string;
    motivo?: string;
    medico?: string;
    color?: string;
}