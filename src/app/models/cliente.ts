/**
 * Cliente (propietario de mascotas) de la clínica.
 */
export class Cliente {
    /** Identificador del cliente. */
    clienteId?: number;
    /** Usuario del sistema asociado. */
    usuarioId?: number;
    /** Tipo de documento (CC, TI, CE). */
    tipoDocumento?: string;
    /** Número de documento. */
    numeroDocumento?: string;
    /** Fecha de nacimiento. */
    fechaNacimiento?: Date;
    /** Nombres. */
    nombres?: string;
    /** Apellidos. */
    apellidos?: string;
    /** Género (M o F). */
    genero?: string;
    /** Teléfono de contacto. */
    telefono?: string;
    /** Dirección de residencia. */
    direccion?: string;
    /** Indica si el cliente está activo. */
    activo?: boolean;
}
