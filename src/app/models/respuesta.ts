/**
 * Respuesta genérica del backend a operaciones de escritura (MiRespuestaRS).
 */
export class Respuesta {
    /** Código de estado de la operación. */
    status?: number;
    /** Mensaje descriptivo del resultado. */
    message?: string;
}
