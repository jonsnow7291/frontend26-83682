import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Cliente } from 'src/app/models/cliente';
import { ClienteService } from './service/cliente.service';
import { TablaListadoComponent, Columna, Accion, soloFecha } from 'src/app/demo/shared/tabla-listado/tabla-listado.component';

/**
 * Clientes (propietarios): listado con búsqueda y paginación, registro y edición.
 */
@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule, TablaListadoComponent],
  templateUrl: './cliente.component.html'
})
export class ClienteComponent {
  titulo = 'Clientes';
  items: Cliente[] = [];
  form: Cliente = {};
  titleModal = '';
  readonly hoy = new Date().toISOString().substring(0, 10);
  private modal: Modal | null = null;

  columnas: Columna[] = [
    { titulo: 'Documento', valor: (c: Cliente) => `${c.tipoDocumento ?? ''} ${c.numeroDocumento ?? ''}` },
    { titulo: 'Nombres', valor: (c: Cliente) => c.nombres },
    { titulo: 'Apellidos', valor: (c: Cliente) => c.apellidos },
    { titulo: 'Nacimiento', valor: (c: Cliente) => soloFecha(c.fechaNacimiento) },
    { titulo: 'Género', valor: (c: Cliente) => c.genero },
    { titulo: 'Teléfono', valor: (c: Cliente) => c.telefono },
    { titulo: 'Dirección', valor: (c: Cliente) => c.direccion },
    { titulo: 'Activo', valor: (c: Cliente) => c.activo ? 'Sí' : 'No' }
  ];

  acciones: Accion[] = [
    { texto: 'Editar', ejecutar: (c: Cliente) => this.editar(c) }
  ];

  constructor(private readonly servicio: ClienteService) {
    this.listar();
  }

  listar() {
    this.servicio.listarClientes().subscribe({
      next: (data) => this.items = data,
      error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los clientes', 'error')
    });
  }

  nuevo() {
    this.form = { tipoDocumento: 'CC', activo: true };
    this.titleModal = 'Registrar cliente';
    this.abrir();
  }

  editar(c: Cliente) {
    this.form = { ...c, fechaNacimiento: soloFecha(c.fechaNacimiento) as unknown as Date };
    this.titleModal = 'Editar cliente';
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.numeroDocumento?.trim() || !f.nombres?.trim() || !f.apellidos?.trim() || !f.fechaNacimiento) {
      Swal.fire('Atención', 'Documento, nombres, apellidos y fecha de nacimiento son obligatorios', 'warning');
      return;
    }
    const datos = { ...f } as unknown as Record<string, unknown>;
    const peticion = f.clienteId ? this.servicio.actualizar(datos) : this.servicio.guardar(datos);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Cliente guardado', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  private abrir() {
    const el = document.getElementById('modalCliente');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }
}
