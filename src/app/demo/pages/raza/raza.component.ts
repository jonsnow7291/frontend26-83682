import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';
import { TablaListadoComponent, Columna, Accion, fechaHora } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Razas (catálogo): listado con búsqueda y paginación, registro y edición.
 */
@Component({
  selector: 'app-raza',
  imports: [CommonModule, FormsModule, TablaListadoComponent],
  templateUrl: './raza.component.html'
})
export class RazaComponent {
  titulo = 'Razas';
  items: Raza[] = [];
  form: Raza = {};
  titleModal = '';
  private modal: Modal | null = null;

  columnas: Columna[] = [
    { titulo: 'Nombre', valor: (c: Raza) => c.nombre },
    { titulo: 'Especie', valor: (c: Raza) => c.especie },
    { titulo: 'Fecha de creación', valor: (c: Raza) => fechaHora(c.fechaCreacion) }
  ];

  acciones: Accion[] = [
    { texto: 'Editar', ejecutar: (r: Raza) => this.editar(r) }
  ];

  constructor(private readonly servicio: RazaService) {
    this.listar();
  }

  listar() {
    this.servicio.listarRazas().subscribe({
      next: (data) => this.items = data,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar las razas', 'error')
    });
  }

  nueva() {
    this.form = { especie: 'Canino' };
    this.titleModal = 'Registrar raza';
    this.abrir();
  }

  editar(r: Raza) {
    this.form = { razaId: r.razaId, nombre: r.nombre, especie: r.especie };
    this.titleModal = 'Editar raza';
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.nombre?.trim() || !f.especie?.trim()) {
      Swal.fire('Atención', 'El nombre y la especie son obligatorios', 'warning');
      return;
    }
    if (/[<>]/.test(`${f.nombre}${f.especie}`)) {
      Swal.fire('Atención', 'El nombre y la especie no pueden contener < ni >', 'warning');
      return;
    }
    const datos = { ...f } as unknown as Record<string, unknown>;
    const peticion = f.razaId ? this.servicio.actualizar(datos) : this.servicio.guardar(datos);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Raza guardada', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  private abrir() {
    const el = document.getElementById('modalRaza');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }
}
