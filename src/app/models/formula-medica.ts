import { Cita } from "./cita";
import { Medicamento } from "./medicamento";

/**
 * Fórmula médica (prescripción) emitida en una cita atendida.
 */
export class FormulaMedica {
    id?: number;
    cita?: Cita;
    medicamento?: Medicamento;
    dosis?: string;
    frecuencia?: string;
    duracionDias?: number;
    indicaciones?: string;
    fechaEmision?: Date;
    fechaCreacionRegistro?: Date;
    fechaActualizacionRegistro?: Date;
}
