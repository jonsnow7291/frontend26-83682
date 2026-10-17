/**
 * Solicitud de creación/actualización de una historia clínica.
 * `historiaId` es nulo al crear y obligatorio al actualizar.
 */
export class HistoriaMedicaRq {
    historiaId?: number;
    clienteId?: number;
    mascotaId?: number;
    citaId?: number;
    diagnostico?: string;
    observaciones?: string;
}
