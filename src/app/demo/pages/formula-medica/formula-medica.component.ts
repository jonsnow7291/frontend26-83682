import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { FormulaMedica } from 'src/app/models/formula-medica';
import { FormulaMedicaRq } from 'src/app/models/formula-medica-rq';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import { FormulaMedicaService } from './service/formula-medica.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { MedicamentoService } from '../medicamento/service/medicamento.service';

/**
 * Componente de gestión de fórmulas médicas.
 * Permite listar, crear, editar y ver el detalle completo de una prescripción.
 * No permite eliminar: una fórmula emitida hace parte del historial clínico.
 */
@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formula-medica.component.html'
})
export class FormulaMedicaComponent {
  /** Duración máxima del tratamiento en días (igual a la validada en el backend). */
  readonly duracionMaximaDias = 365;

  // Instancias de los modales de Bootstrap.
  modalFormulario: Modal | null = null;
  modalDetalle: Modal | null = null;

  // Estado del formulario.
  titleModal = '';
  titleBoton = '';
  form!: FormGroup;
  formulaSeleccionada: FormulaMedica | null = null;

  // Listado, filtro y detalle.
  items: FormulaMedica[] = [];
  filtro = '';
  formulaVer: FormulaMedica | null = null;

  // Catálogos para los combos dependientes Cliente -> Mascota -> Cita.
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  medicamentos: Medicamento[] = [];

  constructor(
    private readonly formulaService: FormulaMedicaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.cargarCatalogos();
    this.listar();
  }

  /**
   * Inicializa el formulario reactivo con sus validaciones.
   */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [null, Validators.required],
      citaId: [null, Validators.required],
      medicamentoId: [null, Validators.required],
      dosis: ['', [Validators.required, Validators.maxLength(255)]],
      frecuencia: ['', [Validators.required, Validators.maxLength(100)]],
      duracionDias: [null, [Validators.required, Validators.min(1), Validators.max(this.duracionMaximaDias)]],
      indicaciones: [''],
      fechaEmision: ['']
    });
  }

  /**
   * Obtiene los controles del formulario para simplificar las validaciones en la vista.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Fórmulas filtradas por mascota, medicamento o veterinario según el texto del filtro.
   */
  get itemsFiltrados(): FormulaMedica[] {
    const texto = this.filtro.trim().toLowerCase();
    if (!texto) {
      return this.items;
    }
    return this.items.filter((formula) =>
      [
        formula.cita?.mascota?.nombreMascota,
        formula.medicamento?.nombre,
        formula.cita?.medico?.nombres,
        formula.cita?.medico?.apellidos
      ].some((valor) => valor?.toLowerCase().includes(texto))
    );
  }

  /**
   * Cita seleccionada actualmente en el formulario (para mostrar su veterinario y fecha).
   */
  get citaSeleccionada(): Cita | undefined {
    const citaId = this.form.value.citaId;
    return this.citas.find((cita) => cita.id === citaId);
  }

  /**
   * Carga los catálogos de clientes y medicamentos.
   */
  cargarCatalogos() {
    this.clienteService.listarClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => console.error('Error al obtener los clientes:', error)
    });
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => this.medicamentos = data,
      error: (error) => console.error('Error al obtener los medicamentos:', error)
    });
  }

  /**
   * Lista todas las fórmulas médicas.
   */
  listar() {
    this.formulaService.listarFormulas().subscribe({
      next: (data) => this.items = data,
      error: (error) => Swal.fire('Error', error?.error?.message ?? 'No fue posible obtener las fórmulas', 'error')
    });
  }

  /**
   * Carga las mascotas pertenecientes al cliente seleccionado (combo dependiente).
   */
  cargarMascotas(clienteId: number | null) {
    this.mascotas = [];
    if (!clienteId) {
      return;
    }
    this.mascotaService.buscarPorCliente(clienteId).subscribe({
      next: (data) => this.mascotas = data,
      error: (error) => console.error('Error al obtener las mascotas:', error)
    });
  }

  /**
   * Carga las citas atendidas de la mascota seleccionada (combo dependiente).
   */
  cargarCitas(mascotaId: number | null) {
    this.citas = [];
    if (!mascotaId) {
      return;
    }
    this.formulaService.listarCitasDisponibles(mascotaId).subscribe({
      next: (data) => this.citas = data,
      error: (error) => console.error('Error al obtener las citas:', error)
    });
  }

  /**
   * Maneja el cambio de cliente: limpia mascota y cita y recarga las mascotas.
   */
  onClienteChange(clienteId: number | null) {
    this.form.patchValue({ mascotaId: null, citaId: null });
    this.citas = [];
    this.cargarMascotas(clienteId);
  }

  /**
   * Maneja el cambio de mascota: limpia la cita y recarga las citas atendidas.
   */
  onMascotaChange(mascotaId: number | null) {
    this.form.patchValue({ citaId: null });
    this.cargarCitas(mascotaId);
  }

  /**
   * Abre el modal para crear una nueva fórmula médica.
   */
  nuevaFormula() {
    this.formulaSeleccionada = null;
    this.resetFormulario();
    this.mascotas = [];
    this.citas = [];
    this.abrirModal('C');
  }

  /**
   * Abre el modal para editar una fórmula médica existente.
   */
  abrirEdicion(formula: FormulaMedica) {
    this.formulaSeleccionada = formula;
    const clienteId = formula.cita?.cliente?.clienteId ?? null;
    const mascotaId = formula.cita?.mascota?.mascotaId ?? null;
    this.form.patchValue({
      clienteId: clienteId,
      mascotaId: mascotaId,
      citaId: formula.cita?.id ?? null,
      medicamentoId: formula.medicamento?.id ?? null,
      dosis: formula.dosis ?? '',
      frecuencia: formula.frecuencia ?? '',
      duracionDias: formula.duracionDias ?? null,
      indicaciones: formula.indicaciones ?? '',
      fechaEmision: formula.fechaEmision ? String(formula.fechaEmision).slice(0, 16) : ''
    });
    this.cargarMascotas(clienteId);
    this.cargarCitas(mascotaId);
    this.abrirModal('E');
  }

  /**
   * Reinicia el formulario a su estado inicial.
   */
  resetFormulario() {
    this.form.reset({ dosis: '', frecuencia: '', indicaciones: '', fechaEmision: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  /**
   * Abre el modal del formulario indicando el modo (C = crear, E = editar).
   */
  abrirModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Nueva fórmula médica' : 'Editar fórmula médica';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    const modalElement = document.getElementById('modalFormula');
    if (modalElement) {
      this.modalFormulario ??= new Modal(modalElement);
      this.modalFormulario.show();
    }
  }

  /**
   * Cierra el modal del formulario y reinicia el estado.
   */
  cerrarModal() {
    this.modalFormulario?.hide();
    this.resetFormulario();
    this.formulaSeleccionada = null;
  }

  /**
   * Guarda o actualiza la fórmula médica según el modo del formulario.
   * Valida en el cliente que la fecha de emisión no sea anterior a la cita;
   * el backend repite todas las validaciones.
   */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const cita = this.citaSeleccionada;
    if (valores.fechaEmision && cita?.fechaHora && new Date(valores.fechaEmision) < new Date(cita.fechaHora)) {
      Swal.fire('Atención', 'La fecha de emisión no puede ser anterior a la fecha de la consulta', 'warning');
      return;
    }

    const rq: FormulaMedicaRq = {
      formulaId: this.formulaSeleccionada?.id,
      mascotaId: Number(valores.mascotaId),
      citaId: Number(valores.citaId),
      medicamentoId: Number(valores.medicamentoId),
      dosis: valores.dosis,
      frecuencia: valores.frecuencia,
      duracionDias: Number(valores.duracionDias),
      indicaciones: valores.indicaciones || undefined,
      fechaEmision: valores.fechaEmision || undefined
    };

    const peticion = this.formulaSeleccionada
      ? this.formulaService.actualizarFormula(rq)
      : this.formulaService.guardarFormula(rq);

    peticion.subscribe({
      next: (respuesta) => {
        Swal.fire('Éxito', respuesta.message ?? 'Operación exitosa', 'success');
        this.cerrarModal();
        this.listar();
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No fue posible completar la operación';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /**
   * Consulta el detalle completo de una fórmula y lo muestra en el modal "Ver detalle".
   */
  verDetalle(formula: FormulaMedica) {
    if (!formula.id) {
      return;
    }
    this.formulaService.consultarFormula(formula.id).subscribe({
      next: (data) => {
        this.formulaVer = data;
        const modalElement = document.getElementById('modalDetalleFormula');
        if (modalElement) {
          this.modalDetalle ??= new Modal(modalElement);
          this.modalDetalle.show();
        }
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No fue posible obtener el detalle de la fórmula';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /**
   * Cierra el modal de detalle.
   */
  cerrarDetalle() {
    this.modalDetalle?.hide();
    this.formulaVer = null;
  }
}
