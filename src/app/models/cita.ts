import { Cliente } from "./cliente";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

/**
 * Cita médica agendada para una mascota.
 */
export class Cita {
    /** Identificador de la cita. */
    id?: number;
    /** Cliente que solicita la cita. */
    cliente?: Cliente;
    /** Mascota atendida. */
    mascota?: Mascota;
    /** Veterinario asignado. */
    medico?: Medico;
    /** Fecha y hora de la cita. */
    fechaHora?: Date;
    /** Estado (Pendiente, Programada, Confirmada, Atendida, Cancelada). */
    estado?: string;
    /** Motivo de la consulta. */
    motivo?: string;
}
