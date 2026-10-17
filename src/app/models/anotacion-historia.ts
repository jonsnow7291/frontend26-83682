import { HistoriaMedica } from "./historia-medica";
import { Medico } from "./medico";

/**
 * Anotación clínica registrada dentro de una historia clínica.
 */
export class AnotacionHistoria {
    id?: number;
    historiaMedica?: HistoriaMedica;
    medico?: Medico;
    fecha?: Date;
    descripcion?: string;
    observacion?: string;
    diagnostico?: string;
}
