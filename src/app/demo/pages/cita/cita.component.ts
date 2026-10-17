import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';

import { CitaService, CitaRq } from './service/cita.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { MedicoService } from '../medico/service/medico.service';

/**
 * Componente principal para la gestión integral de Citas Médicas.
 * Incluye DataTable con paginación, filtros, ordenamiento, y formulario modal reactivo
 * con combos dependientes (Cliente -> Mascotas) y reglas de negocio.
 */
@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent implements OnInit {

  /**
   * Instancia del modal del formulario.
   */
  modalInstance: Modal | null = null;
  /**
   * Título del modal.
   */
  titleModal = '';
  /**
   * Modo del formulario (C = crear, E = editar).
   */
  modoFormulario: 'C' | 'E' = 'C';
  /**
   * Texto del botón de guardar.
   */
  titleBoton = '';

  /**
   * Citas recibidas del backend.
   */
  listCitas: Cita[] = [];
  /**
   * Texto de búsqueda actual.
   */
  terminoBusqueda = '';
  /**
   * Filtro de fecha inicial (yyyy-MM-dd).
   */
  fechaInicial = '';
  /**
   * Filtro de fecha final (yyyy-MM-dd).
   */
  fechaFinal = '';

  /**
   * Página visible.
   */
  paginaActual = 1;
  /**
   * Registros por página.
   */
  readonly registrosPorPagina = 10;

  /**
   * Columna por la que se ordena el listado.
   */
  columnaOrden = 'fechaHora';
  /**
   * Sentido del orden (por defecto descendente: más recientes primero).
   */
  ordenAscendente = false; // Por defecto descendente (más recientes primero)

  /**
   * Formulario reactivo de la cita.
   */
  form!: FormGroup;
  /**
   * Cita en edición (`null` al crear).
   */
  citaSeleccionada: Cita | null = null;

  /**
   * Catálogo de clientes.
   */
  listClientes: Cliente[] = [];
  /**
   * Catálogo de veterinarios.
   */
  listMedicos: Medico[] = [];
  /**
   * Mascotas del cliente seleccionado (combo dependiente).
   */
  listMascotasCliente: Mascota[] = [];
  /**
   * Indica que se están cargando las mascotas del cliente.
   */
  cargandoMascotas = false;

  /**
   * Estados válidos de una cita.
   */
  readonly estadosPermitidos: string[] = ['Pendiente', 'Programada', 'Confirmada', 'Atendida', 'Cancelada'];

  /**
   * Fecha mínima permitida para agendar (hoy).
   */
  fechaMinima: string = new Date().toISOString().split('T')[0];

  constructor(
    private readonly citaService: CitaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly medicoService: MedicoService,
    private readonly formBuilder: FormBuilder
  ) { }

  /**
   * Inicializa el formulario, carga los catálogos y lista las citas.
   */
  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarCatalogos();
    this.listar();
  }

  /**
   * Inicializa el formulario reactivo con sus validaciones.
   */
  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [null, Validators.required],
      medicoId: [null, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      estado: ['Pendiente', Validators.required],
      motivo: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Carga los catálogos de Clientes y Médicos Veterinarios.
   */
  cargarCatalogos(): void {
    this.clienteService.listarClientes().subscribe({
      next: (data) => this.listClientes = data ?? [],
      error: (err) => console.error('Error al cargar clientes:', err)
    });

    this.medicoService.listarMedicos().subscribe({
      next: (data) => this.listMedicos = data ?? [],
      error: (err) => console.error('Error al cargar médicos:', err)
    });
  }

  /**
   * Acceso rápido a los controles del formulario.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Consulta las citas en el backend (con o sin filtro de fechas).
   */
  listar(): void {
    const fIni = this.fechaInicial ? `${this.fechaInicial}T00:00:00` : undefined;
    const fFin = this.fechaFinal ? `${this.fechaFinal}T23:59:59` : undefined;

    this.citaService.listarPorFecha(fIni, fFin).subscribe({
      next: (data) => {
        this.listCitas = data ?? [];
        this.paginaActual = 1;
      },
      error: (error) => {
        const msg = error?.error?.message ?? 'No fue posible obtener las citas médicas';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  /**
   * Limpia los filtros de fecha y recarga la lista completa.
   */
  limpiarFiltrosFecha(): void {
    this.fechaInicial = '';
    this.fechaFinal = '';
    this.listar();
  }

  /**
   * Manejador del evento de cambio en el combo de Cliente.
   * Dispara la búsqueda de mascotas pertenecientes al cliente seleccionado (Combo Dependiente).
   */
  onClienteChange(clienteId: number | string | null): void {
    this.form.patchValue({ mascotaId: null });
    this.listMascotasCliente = [];

    if (!clienteId) return;

    this.cargandoMascotas = true;
    this.mascotaService.buscarPorCliente(Number(clienteId)).subscribe({
      next: (mascotas) => {
        this.listMascotasCliente = mascotas ?? [];
        this.cargandoMascotas = false;
        if (this.listMascotasCliente.length === 0) {
          Swal.fire('Atención', 'El cliente seleccionado no tiene mascotas registradas.', 'info');
        }
      },
      error: (err) => {
        this.cargandoMascotas = false;
        console.error('Error al cargar mascotas del cliente:', err);
      }
    });
  }

  /**
   * Abre el modal en modo Creación.
   */
  abrirModalCrear(): void {
    this.citaSeleccionada = null;
    this.modoFormulario = 'C';
    this.titleModal = 'Nueva Cita Médica';
    this.titleBoton = 'Agendar Cita';

    this.form.reset({
      estado: 'Pendiente',
      fecha: this.fechaMinima,
      hora: '09:00'
    });
    this.form.enable();
    this.listMascotasCliente = [];

    this.openModal();
  }

  /**
   * Abre el modal en modo Edición aplicando las restricciones de negocio según estado.
   */
  abrirModalEditar(cita: Cita): void {
    // Regla de Negocio: Cita cancelada no puede reactivarse/modificarse
    if (cita.estado?.toLowerCase() === 'cancelada') {
      Swal.fire('Cita Cancelada', 'Una cita cancelada no puede ser modificada como si continuara activa.', 'warning');
      return;
    }

    this.citaSeleccionada = cita;
    this.modoFormulario = 'E';
    this.titleModal = `Editar Cita #${cita.id}`;
    this.titleBoton = 'Actualizar Cita';

    // Desglosar LocalDateTime en fecha y hora
    let fechaStr = '';
    let horaStr = '';
    if (cita.fechaHora) {
      const d = new Date(cita.fechaHora);
      fechaStr = d.toISOString().split('T')[0];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      horaStr = `${hours}:${minutes}`;
    }

    // Cargar las mascotas del cliente de la cita
    if (cita.cliente?.clienteId) {
      this.mascotaService.buscarPorCliente(cita.cliente.clienteId).subscribe({
        next: (mascotas) => this.listMascotasCliente = mascotas ?? [],
        error: (err) => console.error(err)
      });
    }

    this.form.enable();
    this.form.patchValue({
      clienteId: cita.cliente?.clienteId ?? null,
      mascotaId: cita.mascota?.mascotaId ?? null,
      medicoId: cita.medico?.id ?? null,
      fecha: fechaStr,
      hora: horaStr,
      estado: cita.estado,
      motivo: cita.motivo ?? ''
    });

    // Regla de Negocio: Cita atendida bloquea modificación de datos históricos
    if (cita.estado?.toLowerCase() === 'atendida') {
      this.form.get('clienteId')?.disable();
      this.form.get('mascotaId')?.disable();
      this.form.get('medicoId')?.disable();
      this.form.get('fecha')?.disable();
      this.form.get('hora')?.disable();
      Swal.fire({
        title: 'Cita Atendida',
        text: 'Esta cita ya fue atendida. La información histórica (cliente, mascota, médico, fecha/hora) está protegida contra modificaciones.',
        icon: 'info',
        timer: 3500
      });
    }

    this.openModal();
  }

  /**
   * Guarda o actualiza la cita médica.
   */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Campos requeridos', 'Por favor diligencie todos los campos obligatorios.', 'warning');
      return;
    }

    // Obtener valores raw (incluso si algunos campos están disabled por estado atendida)
    const val = this.form.getRawValue();
    const fechaHoraCompleta = `${val.fecha}T${val.hora}:00`;

    const rq: CitaRq = {
      clienteId: Number(val.clienteId),
      mascotaId: Number(val.mascotaId),
      medicoId: Number(val.medicoId),
      fechaHora: fechaHoraCompleta,
      estado: val.estado,
      motivo: val.motivo ? val.motivo.trim() : ''
    };

    if (this.modoFormulario === 'E' && this.citaSeleccionada?.id) {
      rq.citaId = this.citaSeleccionada.id;
    }

    const peticion = this.modoFormulario === 'E'
      ? this.citaService.actualizarCita(rq)
      : this.citaService.guardarCita(rq);

    peticion.subscribe({
      next: (resp) => {
        Swal.fire('¡Éxito!', resp.message ?? 'Operación realizada correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        const errorMsg = error?.error?.message ?? 'No fue posible guardar la cita.';
        Swal.fire('Validación del Sistema', errorMsg, 'error');
      }
    });
  }

  /**
   * Cancela una cita médica previa confirmación del usuario.
   */
  cancelarCita(cita: Cita): void {
    if (cita.estado?.toLowerCase() === 'cancelada') {
      Swal.fire('Atención', 'Esta cita ya se encuentra cancelada.', 'info');
      return;
    }
    if (cita.estado?.toLowerCase() === 'atendida') {
      Swal.fire('Acción no permitida', 'No es posible cancelar una cita que ya fue atendida.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Cancelar esta cita?',
      text: `Mascota: ${cita.mascota?.nombreMascota ?? ''} | Fecha: ${cita.fechaHora ?? ''}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar cita',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed && cita.id) {
        this.citaService.cancelarCita(cita.id).subscribe({
          next: (resp) => {
            Swal.fire('Cancelada', resp.message ?? 'La cita ha sido cancelada.', 'success');
            this.listar();
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Error al cancelar la cita.';
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }

  /**
   * Abre el modal del formulario.
   */
  openModal(): void {
    const modalEl = document.getElementById('modalCita');
    if (modalEl) {
      this.modalInstance ??= new Modal(modalEl);
      this.modalInstance.show();
    }
  }

  /**
   * Cierra el modal y reinicia el formulario.
   */
  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.form.reset();
  }

  /**
   * Actualiza el término de búsqueda y vuelve a la primera página.
   * @param event evento del campo de búsqueda.
   */
  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  /**
   * Ordena por la columna indicada; si ya estaba ordenada por ella, invierte el sentido.
   * @param columna clave de la columna.
   */
  ordenarPor(columna: string): void {
    if (this.columnaOrden === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = columna;
      this.ordenAscendente = true;
    }
  }

  /**
   * Citas que cumplen la búsqueda, ordenadas según la columna seleccionada.
   */
  get citasFiltradas(): Cita[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    let resultado = this.listCitas;

    if (termino) {
      resultado = resultado.filter((c) => {
        const valores = [
          c.cliente?.nombres,
          c.cliente?.apellidos,
          c.mascota?.nombreMascota,
          c.medico?.nombres,
          c.medico?.apellidos,
          c.estado,
          c.motivo,
          c.fechaHora ? formatDate(c.fechaHora, 'yyyy-MM-dd HH:mm', 'en-US') : ''
        ];
        return valores.some(v => v && this.normalizarTexto(String(v)).includes(termino));
      });
    }

    // Ordenamiento
    return resultado.sort((a, b) => {
      const valA = this.obtenerValorColumna(a, this.columnaOrden);
      const valB = this.obtenerValorColumna(b, this.columnaOrden);

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const comparacion = valA > valB ? 1 : -1;
      return this.ordenAscendente ? comparacion : -comparacion;
    });
  }

  /**
   * Obtiene el valor de una cita usado para ordenar por la columna indicada.
   * @param c       cita.
   * @param columna clave de la columna.
   */
  private obtenerValorColumna(c: Cita, columna: string): string | number {
    switch (columna) {
      case 'fechaHora': return c.fechaHora ? new Date(c.fechaHora).getTime() : 0;
      case 'cliente': return `${c.cliente?.nombres ?? ''} ${c.cliente?.apellidos ?? ''}`.toLowerCase();
      case 'mascota': return (c.mascota?.nombreMascota ?? '').toLowerCase();
      case 'medico': return `${c.medico?.nombres ?? ''} ${c.medico?.apellidos ?? ''}`.toLowerCase();
      case 'estado': return (c.estado ?? '').toLowerCase();
      default: return '';
    }
  }

  /**
   * Citas de la página actual.
   */
  get citasPaginadas(): Cita[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.citasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  /**
   * Número total de páginas.
   */
  get totalPaginas(): number {
    return Math.ceil(this.citasFiltradas.length / this.registrosPorPagina) || 1;
  }

  /**
   * Números de página para el paginador.
   */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /**
   * Cambia a la página indicada si está en rango.
   * @param pagina número de página.
   */
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * Normaliza un texto: minúsculas y sin tildes.
   * @param texto texto a normalizar.
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Retorna la clase CSS del badge según el estado de la cita.
   */
  obtenerBadgeEstado(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmada': return 'bg-primary';
      case 'programada': return 'bg-info text-dark';
      case 'atendida': return 'bg-success';
      case 'cancelada': return 'bg-danger';
      case 'pendiente': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}
