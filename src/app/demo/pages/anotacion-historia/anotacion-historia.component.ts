import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';
import { AnotacionHistoriaService } from './service/anotacion-historia.service';
import { HistoriaMedicaService } from '../historia-medica/service/historia-medica.service';
import { MedicoService } from '../medico/service/medico.service';
import { PaginadorComponent } from 'src/app/demo/shared/paginador/paginador.component';
import { TablaDatos, tiempo, nombreCompleto, mensajeError } from 'src/app/utils/tabla-datos';

/**
 * Componente de gestión de anotaciones de una historia médica: lista (con filtro,
 * ordenamiento y paginación), registra y edita anotaciones.
 */
@Component({
  selector: 'app-anotacion-historia',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginadorComponent],
  templateUrl: './anotacion-historia.component.html'
})
export class AnotacionHistoriaComponent {
  /**
   * Instancia del modal del formulario.
   */
  modalFormulario: Modal | null = null;
  /**
   * Título del modal.
   */
  titleModal = '';
  /**
   * Modo del formulario (C = crear, E = editar).
   */
  modoFormulario = '';
  /**
   * Texto del botón de guardar.
   */
  titleBoton = '';
  /**
   * Formulario reactivo de la anotación.
   */
  form!: FormGroup;
  /**
   * Anotación en edición (`null` al crear).
   */
  anotacionSeleccionada: AnotacionHistoria | null = null;

  /** Indica que se está cargando el listado. */
  cargando = false;
  /** Indica que se está guardando el formulario. */
  guardando = false;

  /** DataTable de anotaciones, de la más reciente a la más antigua. */
  tabla = new TablaDatos<AnotacionHistoria>(
    {
      fecha: (a) => tiempo(a.fecha),
      medico: (a) => nombreCompleto(a.medico)
    },
    (a) => [a.descripcion, a.observacion, a.diagnostico, a.medico?.nombres, a.medico?.apellidos],
    'fecha'
  );

  /**
   * Catálogo de historias clínicas.
   */
  historias: HistoriaMedica[] = [];
  /**
   * Catálogo de veterinarios.
   */
  medicos: Medico[] = [];
  /**
   * Historia clínica cuyas anotaciones se muestran.
   */
  historiaId: number | null = null;

  constructor(
    private readonly anotacionService: AnotacionHistoriaService,
    private readonly historiaService: HistoriaMedicaService,
    private readonly medicoService: MedicoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.cargarCatalogos();
  }

  /**
   * Inicializa el formulario reactivo con sus validaciones.
   */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      historiaId: [null, Validators.required],
      medicoId: [null, Validators.required],
      descripcion: ['', Validators.required],
      observacion: [''],
      diagnostico: ['', Validators.required]
    });
  }

  /**
   * Carga los catálogos de historias y médicos.
   */
  cargarCatalogos() {
    this.historiaService.listarHistorias().subscribe({
      next: (data) => {
        this.historias = data;
        if (data.length > 0 && this.historiaId === null) {
          this.historiaId = data[0].id ?? null;
          this.listar();
        }
      },
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las historias'), 'error')
    });

    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.medicos = data,
      error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener los veterinarios'), 'error')
    });
  }

  /**
   * Obtiene los controles del formulario para simplificar las validaciones en la vista.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Lista las anotaciones de la historia médica seleccionada.
   */
  listar() {
    if (this.historiaId === null) {
      this.tabla.setItems([]);
      return;
    }
    this.cargando = true;
    this.anotacionService.listarAnotaciones(this.historiaId)
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (data) => this.tabla.setItems(data),
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible obtener las anotaciones'), 'error')
      });
  }

  /**
   * Abre el modal para crear una nueva anotación.
   */
  nuevaAnotacion() {
    this.anotacionSeleccionada = null;
    this.resetFormulario();
    this.form.patchValue({ historiaId: this.historiaId });
    this.abrirModal('C');
  }

  /**
   * Abre el modal para editar una anotación existente.
   */
  abrirEdicion(anotacion: AnotacionHistoria) {
    this.anotacionSeleccionada = anotacion;
    this.form.patchValue({
      historiaId: anotacion.historiaMedica?.id ?? null,
      medicoId: anotacion.medico?.id ?? null,
      descripcion: anotacion.descripcion ?? '',
      observacion: anotacion.observacion ?? '',
      diagnostico: anotacion.diagnostico ?? ''
    });
    this.abrirModal('E');
  }

  /**
   * Reinicia el formulario a su estado inicial.
   */
  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  /**
   * Abre un modal de Bootstrap indicando el modo (C = crear, E = editar).
   */
  abrirModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear anotación' : 'Editar anotación';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalAnotacion');
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
    this.anotacionSeleccionada = null;
  }

  /**
   * Guarda o actualiza la anotación según el modo del formulario.
   */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Campos requeridos', 'Por favor diligencie todos los campos obligatorios.', 'warning');
      return;
    }

    const rq: AnotacionHistoriaRq = {
      anotacionId: this.anotacionSeleccionada?.id,
      historiaId: Number(this.form.value.historiaId),
      medicoId: Number(this.form.value.medicoId),
      descripcion: this.form.value.descripcion,
      observacion: this.form.value.observacion || undefined,
      diagnostico: this.form.value.diagnostico
    };

    const peticion = this.anotacionSeleccionada
      ? this.anotacionService.actualizarAnotacion(rq)
      : this.anotacionService.guardarAnotacion(rq);

    this.guardando = true;
    peticion
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: (respuesta) => {
          Swal.fire('Éxito', respuesta.message ?? 'Operación exitosa', 'success');
          this.cerrarModal();
          this.historiaId = rq.historiaId ?? null;
          this.listar();
        },
        error: (error) => Swal.fire('Error', mensajeError(error, 'No fue posible completar la operación'), 'error')
      });
  }
}
