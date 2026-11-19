/**
 * Detalle de una fórmula médica (medicamento prescrito).
 */
export interface FormulaMedicaDetalle {
    id?: number;
    medicamentoId?: number;
    medicamentoNombre?: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    cantidad: number;
    viaAdministracion?: string;
    indicacionesEspeciales?: string;
}