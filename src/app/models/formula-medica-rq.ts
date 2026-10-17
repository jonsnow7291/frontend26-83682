/**
 * Solicitud de creación/actualización de una fórmula médica.
 * `formulaId` es nulo al crear y obligatorio al actualizar.
 */
export class FormulaMedicaRq {
    formulaId?: number;
    mascotaId?: number;
    citaId?: number;
    medicamentoId?: number;
    dosis?: string;
    frecuencia?: string;
    duracionDias?: number;
    indicaciones?: string;
    fechaEmision?: string;
}
