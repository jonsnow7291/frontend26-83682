import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs';
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
import { CitaService } from '../cita/service/cita.service';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { PaginadorComponent } from 'src/app/demo/shared/paginador/paginador.component';
import { TablaDatos, tiempo, nombreCompleto, mensajeError } from 'src/app/utils/tabla-datos';

/**
 * Componente de gestión de fórmulas médicas.
 * Permite listar (con filtros, ordenamiento y paginación), crear, editar y ver el
 * detalle completo de una prescripción. No permite eliminar: una fórmula emitida
 * hace parte del historial clínico.
 */
@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginadorComponent],
  templateUrl: './formula-medica.component.html'
})
export class FormulaMedicaComponent {
  /** Duración máxima del tratamiento en días (igual a la validada en el backend). */
  readonly duracionMaximaDias = 365;

  /** Instancia del modal del formulario. */
  modalFormulario: Modal | null = null;
  /** Instancia del modal de detalle. */
  modalDetalle: Modal | null = null;

  /** Título del modal del formulario. */
  titleModal = '';
  /** Texto del botón de guardar. */
  titleBoton = '';
  /** Formulario reactivo de la fórmula. */
  form!: FormGroup;
  /** Fórmula en edición (`null` al crear). */
  formulaSeleccionada: FormulaMedica | null = null;
  /** Fórmula mostrada en el modal de detalle. */
  formulaVer: FormulaMedica | null = null;

  /** Indica que se está cargando el listado. */
  cargando = false;
  /** Indica que se está guardando el formulario. */
  guardando = false;
  /** Indica que se están cargando las mascotas del cliente. */
  cargandoMascotas = false;
  /** Indica que se están cargando las citas de la mascota. */
  cargandoCitas = false;

  /** DataTable con búsqueda, ordenamiento (inicial: más recientes primero) y paginación. */
  tabla = new TablaDatos<FormulaMedica>(
    {
      id: (f) => f.id,
      mascota: (f) => f.cita?.mascota?.nombreMascota?.toLowerCase(),
      cliente: (f) => nombreCompleto(f.cita?.cliente),
      medicamento: (f) => f.medicamento?.nombre?.toLowerCase(),
      medico: (f) => nombreCompleto(f.cita?.medico),
      fechaEmision: (f) => tiempo(f.fechaEmision),
      fechaCreacion: (f) => tiempo(f.fechaCreacionRegistro)
    },
    (f) => [
      f.id,
      f.cita?.mascota?.nombreMascota,
      f.cita?.cliente?.nombres,
      f.cita?.cliente?.apellidos,
      f.medicamento?.nombre,
      f.cita?.medico?.nombres,
      f.cita?.medico?.apellidos
    ],
    'fechaCreacion'
  );

  /** Catálogo de clientes (primer combo dependiente). */
  clientes: Cliente[] = [];
  /** Mascotas del cliente seleccionado. */
  mascotas: Mascota[] = [];
  /** Citas atendidas de la mascota seleccionada. */
  citas: Cita[] = [];
  /** Catálogo de medicamentos. */
  medicamentos: Medicamento[] = [];

  constructor(
    private readonly formulaService: FormulaMedicaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly citaService: CitaService,
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
      next: (data) => this.clientes = data ?? [],
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener los clientes'), 'error')
    });
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => this.medicamentos = data ?? [],
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener los medicamentos'), 'error')
    });
  }

  /**
   * Lista todas las fórmulas médicas.
   */
  listar() {
    this.cargando = true;
    this.formulaService.listarFormulas()
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (data) => this.tabla.setItems(data),
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las fórmulas'), 'error')
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
    this.cargandoMascotas = true;
    this.mascotaService.buscarPorCliente(clienteId)
      .pipe(finalize(() => this.cargandoMascotas = false))
      .subscribe({
        next: (data) => this.mascotas = data ?? [],
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las mascotas'), 'error')
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
    this.cargandoCitas = true;
    this.citaService.listarAtendidasPorMascota(mascotaId)
      .pipe(finalize(() => this.cargandoCitas = false))
      .subscribe({
        next: (data) => this.citas = data ?? [],
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las citas'), 'error')
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
   * Valida en el cliente los campos obligatorios y que la fecha de emisión no sea
   * anterior a la cita; el backend repite todas las validaciones.
   */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Campos requeridos', 'Por favor diligencie todos los campos obligatorios.', 'warning');
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

    this.guardando = true;
    peticion
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: (respuesta) => {
          Swal.fire('Éxito', respuesta.message ?? 'Operación exitosa', 'success');
          this.cerrarModal();
          this.listar();
        },
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible completar la operación'), 'error')
      });
  }

  /**
   * Consulta el detalle completo de una fórmula y lo muestra en el modal "Ver".
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
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener el detalle de la fórmula'), 'error')
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
