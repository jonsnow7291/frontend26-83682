import { Cita } from "./cita";
import { Mascota } from "./mascota";

/**
 * Historia clínica de una mascota, originada en una cita atendida.
 */
export class HistoriaMedica {
    id?: number;
    mascota?: Mascota;
    cita?: Cita;
    diagnostico?: string;
    observaciones?: string;
    fechaCreacion?: Date;
}
