import { Cita } from "./cita";
import { Inventario } from "./inventario";

/** Línea de una fórmula: un medicamento con su posología y cantidad. */
export interface FormulaDetalle {
    id?: number;
    medicamento?: Inventario;
    dosis?: string;
    frecuencia?: string;
    duracionDias?: number;
    unidadesPorDosis?: number | null;
    dosisPorDia?: number | null;
    cantidadPrescrita?: number;
    viaAdministracion?: string;
    indicaciones?: string;
}

/**
 * Fórmula médica con uno o varios medicamentos. `estado`: BORRADOR (editable, sin despacho) o
 * CONFIRMADA (el médico la confirmó; pasa a despacho). Crearla NO descuenta inventario.
 */
export interface FormulaMedica {
    id?: number;
    cita?: Cita;
    estado?: string;
    estadoDespacho?: string;
    indicaciones?: string;
    fechaEmision?: string;
    fechaConfirmacion?: string;
    detalles?: FormulaDetalle[];
}

/** Línea enviada al crear o editar una fórmula (`FormulaMedicaRq.Detalle`). */
export interface FormulaLineaRq {
    medicamentoId: number | null;
    dosis: string;
    frecuencia: string;
    duracionDias: number | null;
    unidadesPorDosis?: number | null;
    dosisPorDia?: number | null;
    cantidadPrescrita?: number | null;
    viaAdministracion?: string;
    indicaciones?: string;
}

/** Solicitud de creación/edición de una fórmula (`FormulaMedicaRq`). */
export interface FormulaMedicaRq {
    formulaId?: number;
    citaId: number;
    indicaciones?: string;
    detalles: FormulaLineaRq[];
}

/** Disponibilidad de un medicamento de la fórmula. */
export interface DisponibilidadFormula {
    medicamentoId: number;
    medicamento: string;
    cantidadPrescrita: number;
    stockVigente: number;
    disponible: boolean;
}
