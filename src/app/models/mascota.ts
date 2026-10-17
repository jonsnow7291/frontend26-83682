import { Cliente } from "./cliente";
import { Raza } from "./raza";

/**
 * Mascota (paciente) de la clínica.
 */
export class Mascota {
    /** Identificador de la mascota. */
    mascotaId?: number;
    /** Nombre de la mascota. */
    nombreMascota?: string;
    /** Edad en años. */
    edad?: number;
    /** Fecha de registro. */
    fechaRegistro?: Date;
    /** Raza de la mascota. */
    raza?: Raza;
    /** Cliente propietario. */
    cliente?: Cliente;
}
