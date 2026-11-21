/**
 * Información del usuario autenticado almacenada en el cliente.
 */
export interface UsuarioAuth {
    /** Identificador del usuario. */
    id?: number;
    /** Nombre de usuario o correo. */
    username?: string;
    /** Rol del usuario (ADMIN, SECRETARIA, MEDICO, DESPACHO_MEDICO). */
    rol?: string;
    /** Médico asociado al usuario (solo rol MEDICO). */
    medicoId?: number | null;
    /** Token JWT de sesión. */
    token?: string;
}