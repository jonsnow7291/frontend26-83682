import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Horario } from 'src/app/models/horario';
import { Medico } from 'src/app/models/medico';
import { HorarioService } from './service/horario.service';
import { MedicoService } from '../medico/service/medico.service';

/**
 * Horarios de disponibilidad de los veterinarios. Las citas solo pueden programarse dentro de
 * estas franjas (regla de negocio de citas).
 */
@Component({
  selector: 'app-horario',
  imports: [CommonModule, FormsModule],
  templateUrl: './horario.component.html'
})
export class HorarioComponent {
  readonly dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  medicos: Medico[] = [];
  medicoId: number | null = null;
  horarios: Horario[] = [];
  cargando = false;
  form: Horario = {};
  private modal: Modal | null = null;

  constructor(private readonly servicio: HorarioService, private readonly medicoService: MedicoService) {
    this.medicoService.listarMedicos().subscribe({ next: (m) => this.medicos = m, error: () => this.medicos = [] });
  }

  listar() {
    if (!this.medicoId) { this.horarios = []; return; }
    this.cargando = true;
    this.servicio.listar(this.medicoId).subscribe({
      next: (h) => { this.horarios = h; this.cargando = false; },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudieron cargar los horarios', 'error'); }
    });
  }

  nuevo() {
    this.form = { medicoId: this.medicoId!, diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', activo: true };
    this.abrir();
  }

  editar(h: Horario) {
    this.form = { ...h, horaInicio: h.horaInicio?.substring(0, 5), horaFin: h.horaFin?.substring(0, 5) };
    this.abrir();
  }

  guardar() {
    const f = this.form;
    if (!f.diaSemana || !f.horaInicio || !f.horaFin) { Swal.fire('Atención', 'Día, hora de inicio y hora de fin son obligatorios', 'warning'); return; }
    if (f.horaFin <= f.horaInicio) { Swal.fire('Atención', 'La hora de fin debe ser posterior a la de inicio', 'warning'); return; }
    const peticion = f.id ? this.servicio.actualizar(f) : this.servicio.crear(f);
    peticion.subscribe({
      next: () => { this.modal?.hide(); Swal.fire('Éxito', 'Horario guardado', 'success'); this.listar(); },
      error: (e) => Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error')
    });
  }

  eliminar(h: Horario) {
    Swal.fire({ title: 'Eliminar franja', text: `${this.dias[h.diaSemana!]} ${h.horaInicio?.substring(0, 5)} – ${h.horaFin?.substring(0, 5)}`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar' }).then((r) => {
      if (!r.isConfirmed) { return; }
      this.servicio.eliminar(h.id!).subscribe({ next: () => this.listar(), error: (e) => Swal.fire('Error', e?.error?.message ?? 'No se pudo eliminar', 'error') });
    });
  }

  private abrir() {
    const el = document.getElementById('modalHorario');
    if (el) { this.modal = new Modal(el); this.modal.show(); }
  }
}
