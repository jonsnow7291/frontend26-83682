import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { AnotacionHistoriaRq } from 'src/app/models/anotacion-historia-rq';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';
import { AnotacionHistoriaService } from './service/anotacion-historia.service';
import { HistoriaMedicaService } from '../historia-medica/service/historia-medica.service';
import { MedicoService } from '../medico/service/medico.service';

/**
 * Componente de gestión de anotaciones de una historia médica.
 */
@Component({
  selector: 'app-anotacion-historia',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './anotacion-historia.component.html'
})
export class AnotacionHistoriaComponent {
  modalFormulario: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';
  form!: FormGroup;
  anotacionSeleccionada: AnotacionHistoria | null = null;

  items: AnotacionHistoria[] = [];
  historias: HistoriaMedica[] = [];
  medicos: Medico[] = [];
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
      descripcion: ['', Validators.required]
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
      error: (error) => console.error('Error al obtener las historias:', error)
    });

    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.medicos = data,
      error: (error) => console.error('Error al obtener los médicos:', error)
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
      this.items = [];
      return;
    }
    this.anotacionService.listarAnotaciones(this.historiaId).subscribe({
      next: (data) => this.items = data,
      error: (error) => Swal.fire('Error', error?.error?.message ?? 'No fue posible obtener las anotaciones', 'error')
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
      descripcion: anotacion.descripcion ?? ''
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
      return;
    }

    const rq: AnotacionHistoriaRq = {
      anotacionId: this.anotacionSeleccionada?.id,
      historiaId: Number(this.form.value.historiaId),
      medicoId: Number(this.form.value.medicoId),
      descripcion: this.form.value.descripcion
    };

    const peticion = this.anotacionSeleccionada
      ? this.anotacionService.actualizarAnotacion(rq)
      : this.anotacionService.guardarAnotacion(rq);

    peticion.subscribe({
      next: (respuesta) => {
        Swal.fire('Éxito', respuesta.message ?? 'Operación exitosa', 'success');
        this.cerrarModal();
        this.historiaId = rq.historiaId;
        this.listar();
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No fue posible completar la operación';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }
}
