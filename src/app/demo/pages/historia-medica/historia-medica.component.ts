import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaMedicaRq } from 'src/app/models/historia-medica-rq';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Cita } from 'src/app/models/cita';
import { Medico } from 'src/app/models/medico';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { HistoriaMedicaService } from './service/historia-medica.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { CitaService } from '../cita/service/cita.service';
import { MedicoService } from '../medico/service/medico.service';
import { AnotacionHistoriaService } from '../anotacion-historia/service/anotacion-historia.service';
import { PaginadorComponent } from 'src/app/demo/shared/paginador/paginador.component';
import { TablaDatos, tiempo, nombreCompleto, mensajeError, badgeEstadoCita } from 'src/app/utils/tabla-datos';

/**
 * Componente de gestión de historias clínicas.
 * Permite listar (con filtros, ordenamiento y paginación), crear, editar y eliminar
 * historias, y desde el botón "Ver" consultar su detalle con el histórico de
 * anotaciones, el detalle de cada anotación y el registro de nuevas anotaciones.
 */
@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginadorComponent],
  templateUrl: './historia-medica.component.html'
})
export class HistoriaMedicaComponent {
  /** Instancia del modal del formulario de historia. */
  modalFormulario: Modal | null = null;
  /** Instancia del modal "Ver" (detalle e historial). */
  modalHistorial: Modal | null = null;

  /** Título del modal del formulario. */
  titleModal = '';
  /** Texto del botón de guardar. */
  titleBoton = '';
  /** Formulario reactivo de la historia clínica. */
  form!: FormGroup;
  /** Formulario reactivo de una nueva anotación (dentro del modal "Ver"). */
  formAnotacion!: FormGroup;
  /** Historia en edición (`null` al crear). */
  historiaSeleccionada: HistoriaMedica | null = null;

  /** Filtro de fecha inicial (yyyy-MM-dd). */
  fechaInicial = '';
  /** Filtro de fecha final (yyyy-MM-dd). */
  fechaFinal = '';

  /** Indica que se está cargando el listado. */
  cargando = false;
  /** Indica que se está guardando la historia. */
  guardando = false;
  /** Indica que se están cargando las anotaciones del modal "Ver". */
  cargandoAnotaciones = false;
  /** Indica que se está guardando una anotación. */
  guardandoAnotacion = false;
  /** Indica que se están cargando las mascotas del cliente. */
  cargandoMascotas = false;
  /** Indica que se están cargando las citas de la mascota. */
  cargandoCitas = false;
  /** Muestra u oculta el formulario de nueva anotación. */
  mostrarFormAnotacion = false;

  /** DataTable de historias, ordenado inicialmente por fecha de la consulta (descendente). */
  tabla = new TablaDatos<HistoriaMedica>(
    {
      fecha: (h) => tiempo(h.cita?.fechaHora ?? h.fechaCreacion),
      mascota: (h) => h.mascota?.nombreMascota?.toLowerCase(),
      cliente: (h) => nombreCompleto(h.mascota?.cliente),
      medico: (h) => nombreCompleto(h.cita?.medico),
      motivo: (h) => h.cita?.motivo?.toLowerCase(),
      estado: (h) => h.cita?.estado?.toLowerCase()
    },
    (h) => [
      h.id,
      h.mascota?.nombreMascota,
      h.mascota?.cliente?.nombres,
      h.mascota?.cliente?.apellidos,
      h.cita?.medico?.nombres,
      h.cita?.medico?.apellidos,
      h.cita?.motivo,
      h.cita?.estado,
      h.diagnostico
    ],
    'fecha'
  );

  /** DataTable del histórico de anotaciones, de la más reciente a la más antigua. */
  tablaAnotaciones = new TablaDatos<AnotacionHistoria>(
    {
      fecha: (a) => tiempo(a.fecha),
      medico: (a) => nombreCompleto(a.medico)
    },
    (a) => [a.descripcion, a.observacion, a.diagnostico, a.medico?.nombres, a.medico?.apellidos],
    'fecha',
    false,
    5
  );

  /** Historia mostrada en el modal "Ver". */
  historiaVer: HistoriaMedica | null = null;
  /** Anotación cuyo detalle se muestra dentro del modal "Ver". */
  anotacionDetalle: AnotacionHistoria | null = null;

  /** Catálogo de clientes. */
  clientes: Cliente[] = [];
  /** Mascotas del cliente seleccionado. */
  mascotas: Mascota[] = [];
  /** Citas atendidas de la mascota seleccionada. */
  citas: Cita[] = [];
  /** Catálogo de veterinarios para las anotaciones. */
  medicos: Medico[] = [];

  /** Clase del badge según el estado de la cita (expuesta a la plantilla). */
  readonly badgeEstado = badgeEstadoCita;

  constructor(
    private readonly historiaService: HistoriaMedicaService,
    private readonly mascotaService: MascotaService,
    private readonly clienteService: ClienteService,
    private readonly citaService: CitaService,
    private readonly medicoService: MedicoService,
    private readonly anotacionService: AnotacionHistoriaService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormularios();
    this.cargarCatalogos();
    this.listar();
  }

  /**
   * Inicializa los formularios reactivos con sus validaciones.
   */
  inicializarFormularios() {
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [null, Validators.required],
      citaId: [null, Validators.required],
      diagnostico: ['', Validators.required],
      observaciones: ['']
    });
    this.formAnotacion = this.formBuilder.group({
      medicoId: [null, Validators.required],
      descripcion: ['', Validators.required],
      observacion: [''],
      diagnostico: ['', Validators.required]
    });
  }

  /**
   * Controles del formulario de historia (simplifica las validaciones en la vista).
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Controles del formulario de anotación.
   */
  get fa(): { [key: string]: AbstractControl } {
    return this.formAnotacion.controls;
  }

  /**
   * Cita seleccionada en el formulario (para mostrar veterinario, fecha y motivo).
   */
  get citaSeleccionada(): Cita | undefined {
    const citaId = this.form.value.citaId;
    return this.citas.find((cita) => cita.id === citaId);
  }

  /**
   * Carga los catálogos de clientes y veterinarios.
   */
  cargarCatalogos() {
    this.clienteService.listarClientes().subscribe({
      next: (data) => this.clientes = data ?? [],
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener los clientes'), 'error')
    });
    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.medicos = data ?? [],
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener los veterinarios'), 'error')
    });
  }

  /**
   * Lista las historias clínicas aplicando el filtro de fechas indicado.
   */
  listar() {
    if (!!this.fechaInicial !== !!this.fechaFinal) {
      Swal.fire('Atención', 'Seleccione ambas fechas o deje las dos vacías', 'warning');
      return;
    }
    const inicial = this.fechaInicial ? `${this.fechaInicial}T00:00:00` : undefined;
    const final = this.fechaFinal ? `${this.fechaFinal}T23:59:59` : undefined;
    this.cargando = true;
    this.historiaService.listarHistorias(inicial, final)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (data) => this.tabla.setItems(data),
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las historias'), 'error')
      });
  }

  /**
   * Limpia el filtro de fechas y vuelve a listar.
   */
  limpiarFiltros() {
    this.fechaInicial = '';
    this.fechaFinal = '';
    this.listar();
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
   * Abre el modal para crear una nueva historia clínica.
   */
  nuevaHistoria() {
    this.historiaSeleccionada = null;
    this.resetFormulario();
    this.mascotas = [];
    this.citas = [];
    this.abrirModal('C');
  }

  /**
   * Abre el modal para editar una historia clínica existente.
   */
  abrirEdicion(historia: HistoriaMedica) {
    this.historiaSeleccionada = historia;
    const clienteId = historia.mascota?.cliente?.clienteId ?? null;
    const mascotaId = historia.mascota?.mascotaId ?? null;
    this.form.patchValue({
      clienteId: clienteId,
      mascotaId: mascotaId,
      citaId: historia.cita?.id ?? null,
      diagnostico: historia.diagnostico ?? '',
      observaciones: historia.observaciones ?? ''
    });
    this.cargarMascotas(clienteId);
    this.cargarCitas(mascotaId);
    this.abrirModal('E');
  }

  /**
   * Reinicia el formulario de historia a su estado inicial.
   */
  resetFormulario() {
    this.form.reset({ diagnostico: '', observaciones: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  /**
   * Abre el modal del formulario indicando el modo (C = crear, E = editar).
   */
  abrirModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Nueva historia clínica' : 'Editar historia clínica';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    const modalElement = document.getElementById('modalHistoria');
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
    this.historiaSeleccionada = null;
  }

  /**
   * Guarda o actualiza la historia clínica según el modo del formulario.
   */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Campos requeridos', 'Por favor diligencie todos los campos obligatorios.', 'warning');
      return;
    }

    const valores = this.form.value;
    const rq: HistoriaMedicaRq = {
      historiaId: this.historiaSeleccionada?.id,
      clienteId: Number(valores.clienteId),
      mascotaId: Number(valores.mascotaId),
      citaId: Number(valores.citaId),
      diagnostico: valores.diagnostico,
      observaciones: valores.observaciones || undefined
    };

    const peticion = this.historiaSeleccionada
      ? this.historiaService.actualizarHistoria(rq)
      : this.historiaService.guardarHistoria(rq);

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
   * Elimina una historia clínica previa confirmación. El backend lo impide si
   * la historia ya tiene anotaciones.
   */
  eliminar(historia: HistoriaMedica) {
    if (!historia.id) {
      return;
    }
    Swal.fire({
      title: '¿Eliminar historia?',
      text: 'Solo se pueden eliminar historias sin anotaciones. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.historiaService.eliminarHistoria(historia.id!).subscribe({
          next: (respuesta) => {
            Swal.fire('Éxito', respuesta.message ?? 'Historia eliminada', 'success');
            this.listar();
          },
          error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible eliminar la historia'), 'error')
        });
      }
    });
  }

  /**
   * Abre el modal "Ver" con el detalle de la historia y su histórico de anotaciones.
   */
  verHistorial(historia: HistoriaMedica) {
    if (!historia.id) {
      return;
    }
    this.historiaVer = historia;
    this.anotacionDetalle = null;
    this.mostrarFormAnotacion = false;
    this.tablaAnotaciones.buscar('');
    this.tablaAnotaciones.setItems([]);
    const modalElement = document.getElementById('modalHistorial');
    if (modalElement) {
      this.modalHistorial ??= new Modal(modalElement);
      this.modalHistorial.show();
    }
    this.cargarAnotaciones();
  }

  /**
   * Carga las anotaciones de la historia mostrada en el modal "Ver".
   */
  cargarAnotaciones() {
    if (!this.historiaVer?.id) {
      return;
    }
    this.cargandoAnotaciones = true;
    this.anotacionService.listarAnotaciones(this.historiaVer.id)
      .pipe(finalize(() => this.cargandoAnotaciones = false))
      .subscribe({
        next: (data) => this.tablaAnotaciones.setItems(data),
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las anotaciones'), 'error')
      });
  }

  /**
   * Consulta y muestra el detalle de una anotación dentro del modal "Ver".
   */
  verAnotacion(anotacion: AnotacionHistoria) {
    if (!anotacion.id) {
      return;
    }
    this.anotacionService.consultarAnotacion(anotacion.id).subscribe({
      next: (data) => this.anotacionDetalle = data,
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener la anotación'), 'error')
    });
  }

  /**
   * Muestra el formulario de nueva anotación con el veterinario de la cita preseleccionado.
   */
  abrirFormAnotacion() {
    this.formAnotacion.reset({
      medicoId: this.historiaVer?.cita?.medico?.id ?? null,
      descripcion: '',
      observacion: '',
      diagnostico: ''
    });
    this.anotacionDetalle = null;
    this.mostrarFormAnotacion = true;
  }

  /**
   * Registra una nueva anotación en la historia mostrada y recarga el histórico.
   */
  guardarAnotacion() {
    if (this.formAnotacion.invalid || !this.historiaVer?.id) {
      this.formAnotacion.markAllAsTouched();
      return;
    }
    const valores = this.formAnotacion.value;
    const rq: AnotacionHistoriaRq = {
      historiaId: this.historiaVer.id,
      medicoId: Number(valores.medicoId),
      descripcion: valores.descripcion,
      observacion: valores.observacion || undefined,
      diagnostico: valores.diagnostico
    };
    this.guardandoAnotacion = true;
    this.anotacionService.guardarAnotacion(rq)
      .pipe(finalize(() => this.guardandoAnotacion = false))
      .subscribe({
        next: (respuesta) => {
          Swal.fire('Éxito', respuesta.message ?? 'Anotación registrada', 'success');
          this.mostrarFormAnotacion = false;
          this.cargarAnotaciones();
        },
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible registrar la anotación'), 'error')
      });
  }

  /**
   * Cierra el modal "Ver" y limpia su estado.
   */
  cerrarHistorial() {
    this.modalHistorial?.hide();
    this.historiaVer = null;
    this.anotacionDetalle = null;
    this.mostrarFormAnotacion = false;
    this.tablaAnotaciones.setItems([]);
  }
}
