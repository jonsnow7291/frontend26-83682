import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { Inventario, InventarioRq } from 'src/app/models/inventario';
import { Lote, LoteRq } from 'src/app/models/lote';
import { MovimientoInventario } from 'src/app/models/movimiento-inventario';
import { AuthService } from 'src/app/services/auth.service';
import { InventarioService } from './service/inventario.service';

/**
 * Inventario de medicamentos y utensilios: listado con alertas (agotado, stock bajo, próximo a
 * vencer, vencido), alta/edición, lotes y entradas, e historial de movimientos.
 * El perfil DESPACHO_MEDICO lo ve en solo lectura (el backend también lo exige).
 */
@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent {
  /** Filtros de alerta disponibles. */
  readonly filtros = [
    { valor: 'TODOS', texto: 'Todos' },
    { valor: 'AGOTADOS', texto: 'Agotados' },
    { valor: 'STOCK_BAJO', texto: 'Stock bajo' },
    { valor: 'PROXIMOS_A_VENCER', texto: 'Próximos a vencer' },
    { valor: 'VENCIDOS', texto: 'Con lotes vencidos' }
  ];

  items: Inventario[] = [];
  cargando = false;
  filtro = 'TODOS';
  tipo = '';
  busqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  /** Solo ADMIN y SECRETARIA pueden crear/editar (DESPACHO_MEDICO: solo lectura). */
  readonly puedeEditar: boolean;

  form: InventarioRq = this.formVacio();
  titleModal = '';
  guardando = false;
  private modalForm: Modal | null = null;

  seleccionado: Inventario | null = null;
  lotes: Lote[] = [];
  movimientos: MovimientoInventario[] = [];
  entrada: LoteRq = this.entradaVacia();
  private modalLotes: Modal | null = null;
  private modalMov: Modal | null = null;

  constructor(private readonly servicio: InventarioService, authService: AuthService) {
    this.puedeEditar = authService.tieneRol(['ADMIN', 'SECRETARIA']);
    this.listar();
  }

  /** Consulta el inventario con los filtros actuales. */
  listar() {
    this.cargando = true;
    this.servicio.listar(this.filtro, this.tipo, this.busqueda.trim()).subscribe({
      next: (data) => { this.items = data; this.paginaActual = 1; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el inventario', 'error'); }
    });
  }

  get paginados(): Inventario[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.items.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.items.length / this.registrosPorPagina));
  }

  /** Estado visual del stock de un producto. */
  estado(i: Inventario): { texto: string; clase: string } {
    if (!i.activo) { return { texto: 'Inactivo', clase: 'bg-secondary' }; }
    if ((i.stockActual ?? 0) <= 0) { return { texto: 'Agotado', clase: 'bg-danger' }; }
    if ((i.stockActual ?? 0) <= (i.stockMinimo ?? 0)) { return { texto: 'Stock bajo', clase: 'bg-warning text-dark' }; }
    return { texto: 'Disponible', clase: 'bg-success' };
  }

  /** Estado del lote según su vencimiento (null = sin vencimiento). */
  vigencia(l: Lote): { texto: string; clase: string } {
    if (!l.fechaVencimiento) { return { texto: 'Sin vencimiento', clase: 'bg-secondary' }; }
    const dias = Math.floor((new Date(l.fechaVencimiento).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (dias < 0) { return { texto: 'Vencido', clase: 'bg-danger' }; }
    if (dias <= 30) { return { texto: `Vence en ${dias} d`, clase: 'bg-warning text-dark' }; }
    return { texto: 'Vigente', clase: 'bg-success' };
  }

  // ----- alta / edición -----
  nuevo() {
    this.form = this.formVacio();
    this.titleModal = 'Registrar producto';
    this.abrir('modalInventario', (m) => this.modalForm = m);
  }

  editar(i: Inventario) {
    this.form = {
      id: i.id, codigo: i.codigo ?? '', nombre: i.nombre ?? '', descripcion: i.descripcion, presentacion: i.presentacion,
      tipo: i.tipo ?? 'MEDICAMENTO', registroInvima: i.registroInvima, precioCompra: i.precioCompra ?? 0,
      precioVenta: i.precioVenta ?? 0, ivaPorcentaje: i.ivaPorcentaje ?? 0, stockMinimo: i.stockMinimo ?? 0,
      fechaProximoPedido: i.fechaProximoPedido ?? null, activo: i.activo
    };
    this.titleModal = 'Editar producto';
    this.abrir('modalInventario', (m) => this.modalForm = m);
  }

  /** Validación de cliente (el backend vuelve a validar). */
  errorForm(): string | null {
    const f = this.form;
    if (!/^[A-Za-z0-9]{8}$/.test(f.codigo ?? '')) { return 'El código debe tener exactamente 8 caracteres alfanuméricos'; }
    if (!f.nombre?.trim()) { return 'El nombre es obligatorio'; }
    if (f.tipo === 'MEDICAMENTO' && !f.registroInvima?.trim()) { return 'El registro Invima es obligatorio para los medicamentos'; }
    if (f.precioCompra == null || f.precioCompra < 0 || f.precioVenta == null || f.precioVenta < 0) { return 'Los precios no pueden ser negativos'; }
    if ((f.stockMinimo ?? 0) < 0) { return 'El stock mínimo no puede ser negativo'; }
    return null;
  }

  guardar() {
    const error = this.errorForm();
    if (error) { Swal.fire('Atención', error, 'warning'); return; }
    this.guardando = true;
    const rq: InventarioRq = { ...this.form, registroInvima: this.form.tipo === 'MEDICAMENTO' ? this.form.registroInvima : this.form.registroInvima || undefined };
    const peticion = rq.id ? this.servicio.actualizar(rq) : this.servicio.crear(rq);
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.modalForm?.hide();
        Swal.fire('Éxito', rq.id ? 'Producto actualizado' : 'Producto registrado', 'success');
        this.listar();
      },
      error: (e) => { this.guardando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo guardar', 'error'); }
    });
  }

  cambiarEstado(i: Inventario) {
    const activar = !i.activo;
    Swal.fire({ title: `${activar ? 'Activar' : 'Inactivar'} "${i.nombre}"?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí' })
      .then((r) => {
        if (!r.isConfirmed) { return; }
        this.servicio.cambiarEstado(i.id!, activar).subscribe({
          next: () => this.listar(),
          error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cambiar el estado', 'error')
        });
      });
  }

  // ----- lotes y entradas -----
  verLotes(i: Inventario) {
    this.seleccionado = i;
    this.entrada = this.entradaVacia();
    this.entrada.medicamentoId = i.id!;
    this.entrada.precioCompra = i.precioCompra ?? null;
    this.cargarLotes();
    this.abrir('modalLotes', (m) => this.modalLotes = m);
  }

  private cargarLotes() {
    this.servicio.lotes(this.seleccionado!.id!).subscribe({
      next: (l) => this.lotes = l,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los lotes', 'error')
    });
  }

  registrarEntrada() {
    const e = this.entrada;
    if (!e.numeroLote?.trim() || !e.cantidad || e.cantidad <= 0 || !e.fechaCompra) {
      Swal.fire('Atención', 'Número de lote, cantidad (> 0) y fecha de compra son obligatorios', 'warning'); return;
    }
    if (this.seleccionado?.tipo === 'MEDICAMENTO' && !e.fechaVencimiento) {
      Swal.fire('Atención', 'La fecha de vencimiento es obligatoria para los medicamentos', 'warning'); return;
    }
    if (e.fechaVencimiento && e.fechaVencimiento <= e.fechaCompra) {
      Swal.fire('Atención', 'El vencimiento debe ser posterior a la fecha de compra', 'warning'); return;
    }
    this.servicio.registrarEntrada({ ...e, fechaVencimiento: e.fechaVencimiento || null }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Entrada registrada', 'success');
        this.entrada = this.entradaVacia();
        this.entrada.medicamentoId = this.seleccionado!.id!;
        this.cargarLotes();
        this.listar();
      },
      error: (er) => Swal.fire('Error', er?.error?.message ?? 'No se pudo registrar la entrada', 'error')
    });
  }

  // ----- movimientos -----
  verMovimientos(i: Inventario) {
    this.seleccionado = i;
    this.movimientos = [];
    this.servicio.movimientos(i.id).subscribe({
      next: (m) => this.movimientos = m,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar el historial', 'error')
    });
    this.abrir('modalMovimientos', (m) => this.modalMov = m);
  }

  private abrir(id: string, guardar: (m: Modal) => void) {
    const el = document.getElementById(id);
    if (el) { const m = new Modal(el); guardar(m); m.show(); }
  }

  private formVacio(): InventarioRq {
    return { codigo: '', nombre: '', descripcion: '', presentacion: '', tipo: 'MEDICAMENTO', registroInvima: '', precioCompra: 0, precioVenta: 0, ivaPorcentaje: 0, stockMinimo: 0, fechaProximoPedido: null };
  }

  private entradaVacia(): LoteRq {
    return { medicamentoId: 0, numeroLote: '', cantidad: 0, precioCompra: null, fechaCompra: new Date().toLocaleDateString('en-CA'), fechaVencimiento: null };
  }
}
