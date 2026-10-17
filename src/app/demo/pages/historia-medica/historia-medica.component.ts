import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaMedicaRq } from 'src/app/models/historia-medica-rq';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { HistoriaMedicaService } from './service/historia-medica.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { AnotacionHistoriaService } from '../anotacion-historia/service/anotacion-historia.service';

/**
 * Componente de gestión de historias médicas.
 * Permite listar, crear, editar y consultar el historial de anotaciones de una mascota.
 */
@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './historia-medica.component.html'
})
export class HistoriaMedicaComponent {
  // Instancias de los modales de Bootstrap.
  modalFormulario: Modal | null = null;
  modalHistorial: Modal | null = null;

  // Estado del formulario.
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';
  form!: FormGroup;
  historiaSeleccionada: HistoriaMedica | null = null;

  // Listados y filtros.
  items: HistoriaMedica[] = [];
  anotacionesHistorial: AnotacionHistoria[] = [];
  historiaVer: HistoriaMedica | null = null;
  fechaInicial = '';
  fechaFinal = '';

  // Catálogos para los selects del formulario.
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  clienteIdSeleccionado: number | null = null;

  constructor(
    private readonly historiaService: HistoriaMedicaService,
    private readonly mascotaService: MascotaService,
    private readonly clienteService: ClienteService,
    private readonly anotacionService: AnotacionHistoriaService,
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
      citaId: [null]
    });
  }

  /**
   * Carga el catálogo de clientes que alimenta el primer combo dependiente.
   */
  cargarCatalogos() {
    this.clienteService.listarClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (error) => console.error('Error al obtener los clientes:', error)
    });
  }

  /**
   * Carga las mascotas pertenecientes al cliente seleccionado (combo dependiente).
   */
  cargarMascotas(clienteId: number | null) {
    if (!clienteId) {
      this.mascotas = [];
      return;
    }
    this.mascotaService.buscarPorCliente(clienteId).subscribe({
      next: (data) => this.mascotas = data,
      error: (error) => console.error('Error al obtener las mascotas:', error)
    });
  }

  /**
   * Maneja el cambio de cliente y actualiza el combo de mascotas.
   */
  onClienteChange(clienteId: number | null) {
    this.clienteIdSeleccionado = clienteId;
    this.form.patchValue({ mascotaId: null });
    this.cargarMascotas(clienteId);
  }

  /**
   * Obtiene los controles del formulario para simplificar las validaciones en la vista.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Lista las historias médicas aplicando el filtro de fechas indicado.
   */
  listar() {
    if (!!this.fechaInicial !== !!this.fechaFinal) {
      Swal.fire('Atención', 'Seleccione ambas fechas o deje las dos vacías', 'warning');
      return;
    }
    const inicial = this.fechaInicial ? `${this.fechaInicial}T00:00:00` : undefined;
    const final = this.fechaFinal ? `${this.fechaFinal}T23:59:59` : undefined;
    this.historiaService.listarHistorias(inicial, final).subscribe({
      next: (data) => this.items = data,
      error: (error) => Swal.fire('Error', error?.error?.message ?? 'No fue posible obtener las historias', 'error')
    });
  }

  /**
   * Abre el modal para crear una nueva historia médica.
   */
  nuevaHistoria() {
    this.historiaSeleccionada = null;
    this.resetFormulario();
    this.clienteIdSeleccionado = null;
    this.mascotas = [];
    this.abrirModal('C');
  }

  /**
   * Abre el modal para editar una historia médica existente.
   */
  abrirEdicion(historia: HistoriaMedica) {
    this.historiaSeleccionada = historia;
    const clienteId = historia.mascota?.cliente?.clienteId ?? null;
    this.clienteIdSeleccionado = clienteId;
    this.form.patchValue({
      clienteId: clienteId,
      mascotaId: historia.mascota?.mascotaId ?? null
    });
    this.cargarMascotas(clienteId);
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
    this.titleModal = modo === 'C' ? 'Crear historia médica' : 'Editar historia médica';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    this.modoFormulario = modo;
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
   * Guarda o actualiza la historia médica según el modo del formulario.
   */
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rq: HistoriaMedicaRq = {
      historiaId: this.historiaSeleccionada?.id,
      clienteId: Number(this.form.value.clienteId),
      mascotaId: Number(this.form.value.mascotaId),
      citaId: this.form.value.citaId ? Number(this.form.value.citaId) : undefined
    };

    const peticion = this.historiaSeleccionada
      ? this.historiaService.actualizarHistoria(rq)
      : this.historiaService.guardarHistoria(rq);

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
   * Elimina una historia médica previa confirmación.
   */
  eliminar(historia: HistoriaMedica) {
    if (!historia.id) {
      return;
    }
    Swal.fire({
      title: '¿Eliminar historia?',
      text: 'Esta acción no se puede deshacer.',
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
          error: (error) => {
            const mensaje = error?.error?.message ?? 'No fue posible eliminar la historia';
            Swal.fire('Error', mensaje, 'error');
          }
        });
      }
    });
  }

  /**
   * Abre el modal que muestra el historial de anotaciones de una historia médica.
   */
  verHistorial(historia: HistoriaMedica) {
    if (!historia.id) {
      return;
    }
    this.historiaVer = historia;
    this.anotacionService.listarAnotaciones(historia.id).subscribe({
      next: (data) => {
        this.anotacionesHistorial = data;
        const modalElement = document.getElementById('modalHistorial');
        if (modalElement) {
          this.modalHistorial ??= new Modal(modalElement);
          this.modalHistorial.show();
        }
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No fue posible obtener las anotaciones';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /**
   * Cierra el modal del historial de anotaciones.
   */
  cerrarHistorial() {
    this.modalHistorial?.hide();
    this.historiaVer = null;
    this.anotacionesHistorial = [];
  }
}