/**
 * Cuerpo de la petición para crear/actualizar una mascota (MascotaRq del backend).
 */
export class MascotaRq {
    /** Identificador de la mascota (solo al actualizar). */
    mascotaId?: number;
    /** Nombre de la mascota. */
    nombreMascota?: string;
    /** Edad en años. */
    edad?: number;
    /** Identificador de la raza. */
    razaId?: number;
    /** Identificador del cliente propietario. */
    clienteId?: number;
}
