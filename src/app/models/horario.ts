/**
 * Franja de disponibilidad de un veterinario (día ISO 1=lunes … 7=domingo; horas HH:mm).
 */
export interface Horario {
    id?: number;
    medicoId?: number;
    diaSemana?: number;
    horaInicio?: string;
    horaFin?: string;
    activo?: boolean;
}
