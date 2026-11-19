import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { Inventario } from 'src/app/models/inventario';
import { InventarioService } from './service/inventario.service';

/**
 * Gestión de inventario de medicamentos y utensilios.
 */
@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';
  formularioValido = true;

  items: Inventario[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  form: any = {
    nombre: '', descripcion: '', presentacion: '', codigo: '', tipo: 'medicamento',
    registroInvima: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 0,
    fechaIngreso: '', fechaProximoPedido: ''
  };

  inventarioSeleccionado: Inventario | null = null;

  constructor(private readonly inventarioService: InventarioService) {
    this.listar();
  }

  listar() {
    this.inventarioService.listar().subscribe({
      next: (data) => this.items = data,
      error: (error) => Swal.fire('Error', error?.error?.message ?? 'No se pudo cargar el inventario', 'error')
    });
  }

  get filtrados(): Inventario[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) return this.items;
    return this.items.filter((i) =>
      this.normalizarTexto(i.nombre).includes(termino) ||
      this.normalizarTexto(i.codigo).includes(termino)
    );
  }

  get paginados(): Inventario[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  private normalizarTexto(texto: string): string {
    return texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  estadoBadge(estado: string): string {
    switch (estado) {
      case 'agotado': return 'bg-danger';
      case 'stock_bajo': return 'bg-warning';
      case 'proximo_a_vencer': return 'bg-info';
      case 'vencido': return 'bg-dark';
      default: return 'bg-success';
    }
  }

  nuevo() {
    this.inventarioSeleccionado = null;
    this.formularioValido = true;
    this.form = {
      nombre: '', descripcion: '', presentacion: '', codigo: '', tipo: 'medicamento',
      registroInvima: '', precioCompra: 0, precioVenta: 0, stockActual: 0, stockMinimo: 0,
      fechaIngreso: '', fechaProximoPedido: ''
    };
    this.titleModal = 'Nuevo producto';
    this.titleBoton = 'Guardar';
    this.modoFormulario = 'C';
    this.abrirModal();
  }

  editar(item: Inventario) {
    this.inventarioSeleccionado = item;
    this.form = { ...item };
    this.titleModal = 'Editar producto';
    this.titleBoton = 'Actualizar';
    this.modoFormulario = 'E';
    this.abrirModal();
  }

  abrirModal() {
    const el = document.getElementById('modalInventario');
    if (el) {
      this.modalInstance ??= new Modal(el);
      this.modalInstance.show();
    }
  }

  cerrarModal() {
    this.modalInstance?.hide();
    this.inventarioSeleccionado = null;
  }

  guardar() {
    if (!this.form.nombre || !this.form.codigo) {
      Swal.fire('Atención', 'Nombre y código son obligatorios', 'warning');
      return;
    }
    if (this.form.tipo === 'medicamento' && !this.form.registroInvima) {
      Swal.fire('Atención', 'El registro Invima es obligatorio para medicamentos', 'warning');
      return;
    }

    const peticion = this.modoFormulario === 'E' && this.inventarioSeleccionado
      ? this.inventarioService.actualizar(this.form)
      : this.inventarioService.guardar(this.form);

    peticion.subscribe({
      next: (res) => {
        Swal.fire('Éxito', res.message ?? 'Operación exitosa', 'success');
        this.cerrarModal();
        this.listar();
      },
      error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo guardar', 'error')
    });
  }

  eliminar(item: Inventario) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then((r) => {
      if (r.isConfirmed) {
        this.inventarioService.eliminar(item.id!).subscribe({
          next: (res) => {
            Swal.fire('Éxito', res.message ?? 'Eliminado', 'success');
            this.listar();
          },
          error: (err) => Swal.fire('Error', err?.error?.message ?? 'No se pudo eliminar', 'error')
        });
      }
    });
  }
}