/**
 * Solicitud de creación/actualización de una anotación clínica.
 * `anotacionId` es nulo al crear y obligatorio al actualizar.
 */
export class AnotacionHistoriaRq {
    anotacionId?: number;
    historiaId?: number;
    medicoId?: number;
    descripcion?: string;
    observacion?: string;
    diagnostico?: string;
}
