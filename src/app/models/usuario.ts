/**
 * Usuario del sistema.
 */
export class Usuario {
    /** Identificador del usuario. */
    id?: number;
    /** Nombre de usuario. */
    username?: string;
    /** Rol asignado. */
    rol?: string;
    /** Correo electrónico. */
    email?: string;
    /** Fecha de creación. */
    fechaCreacion?: Date;
    /** Indica si el usuario está activo. */
    activo?: boolean;
}
