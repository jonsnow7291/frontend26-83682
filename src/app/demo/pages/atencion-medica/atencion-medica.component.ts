import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from 'src/app/services/auth.service';
import { AtencionMedica, AtencionRq } from 'src/app/models/atencion-medica';
import { Cita } from 'src/app/models/cita';
import { CitaCalendario } from 'src/app/models/cita-calendario';
import { Tarifa } from 'src/app/models/tarifa';
import { AtencionMedicaService } from './service/atencion-medica.service';
import { CalendarioService } from '../calendario/service/calendario.service';
import { TarifaService } from '../tarifa/service/tarifa.service';
import { abrirPdf } from 'src/app/utils/descarga';

/**
 * Atención de una cita: datos de la mascota, antecedentes médicos, registro de motivo, síntomas,
 * diagnóstico, observaciones y recomendaciones, finalización (con prefactura en PDF) y acceso a la
 * fórmula médica. Sin `?citaId=` muestra las citas por atender para elegir una.
 */
@Component({
  selector: 'app-atencion-medica',
  imports: [CommonModule, FormsModule],
  templateUrl: './atencion-medica.component.html'
})
export class AtencionMedicaComponent {
  /** Citas próximas elegibles (cuando no llega `citaId`). */
  pendientes: CitaCalendario[] = [];
  cita: Cita | null = null;
  atencion: AtencionMedica | null = null;
  antecedentes: AtencionMedica[] = [];
  tarifas: Tarifa[] = [];
  tarifaId: number | null = null;
  form: AtencionRq = { citaId: 0 };
  cargando = false;
  guardando = false;

  constructor(
    private readonly servicio: AtencionMedicaService,
    private readonly calendario: CalendarioService,
    private readonly tarifaService: TarifaService,
    private readonly router: Router,
    private readonly authService: AuthService,
    ruta: ActivatedRoute
  ) {
    ruta.queryParamMap.subscribe((p) => {
      const id = Number(p.get('citaId'));
      if (id) { this.cargarCita(id); } else { this.cita = null; this.atencion = null; this.cargarPendientes(); }
    });
  }

  /** `true` si la atención ya fue finalizada (solo lectura). */
  get finalizada(): boolean { return this.atencion?.estado === 'FINALIZADA'; }

  private cargarPendientes() {
    const desde = new Date(); desde.setDate(desde.getDate() - 7);
    const hasta = new Date(); hasta.setDate(hasta.getDate() + 30);
    const f = (d: Date) => d.toISOString().substring(0, 10) + 'T00:00:00';
    this.calendario.calendario(f(desde), f(hasta), this.authService.obtenerUsuario()?.medicoId).subscribe({
      next: (c) => this.pendientes = c.filter((x) => ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA'].includes(x.estado)),
      error: () => this.pendientes = []
    });
  }

  /** Solo se atienden citas de hoy o de días pasados (regla del backend). */
  esAtendible(c: CitaCalendario): boolean {
    return (c.inicio ?? '').substring(0, 10) <= new Date().toLocaleDateString('en-CA');
  }

  elegir(c: CitaCalendario) {
    this.router.navigate(['/inicio/atencion-medica'], { queryParams: { citaId: c.id } });
  }

  private cargarCita(citaId: number) {
    this.cargando = true;
    this.calendario.consultar(citaId).subscribe({
      next: (cita) => {
        this.cita = cita;
        this.form = { citaId, motivo: cita.motivo };
        this.tarifaService.listar(cita.medico?.especializacionId).subscribe({ next: (t) => this.tarifas = t, error: () => this.tarifas = [] });
        const mascotaId = cita.mascota?.mascotaId;
        if (!mascotaId) { this.cargando = false; return; }
        this.servicio.historialMascota(mascotaId).subscribe({
          next: (lista) => {
            this.atencion = lista.find((a) => a.citaId === citaId) ?? null;
            this.antecedentes = lista.filter((a) => a.citaId !== citaId);
            if (this.atencion) { this.form = { ...this.atencion, citaId, id: this.atencion.id }; this.tarifaId = this.atencion.tarifaId ?? null; }
            this.cargando = false;
          },
          error: () => { this.cargando = false; }
        });
      },
      error: (e) => { this.cargando = false; Swal.fire('Error', e?.error?.message ?? 'No se pudo cargar la cita', 'error'); }
    });
  }

  abrir() {
    this.guardando = true;
    this.servicio.abrir({ ...this.form, tarifaId: this.tarifaId }).subscribe({
      next: (a) => { this.atencion = a; this.form = { ...a, citaId: a.citaId! }; this.guardando = false; Swal.fire('Atención abierta', 'Registre los datos de la consulta', 'success'); },
      error: (e) => { this.guardando = false; Swal.fire('No se pudo abrir', e?.error?.message ?? 'Error inesperado', 'error'); }
    });
  }

  guardar(silencioso = false) {
    if (!this.atencion) { return; }
    this.guardando = true;
    this.servicio.registrar({ ...this.form, id: this.atencion.id, tarifaId: this.tarifaId ?? this.atencion.tarifaId }).subscribe({
      next: (a) => { this.atencion = a; this.guardando = false; if (!silencioso) { Swal.fire('Guardado', 'Datos de la atención guardados', 'success'); } },
      error: (e) => { this.guardando = false; Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error'); }
    });
  }

  finalizar() {
    if (!this.form.diagnostico?.trim()) { Swal.fire('Atención', 'Registre el diagnóstico antes de finalizar', 'warning'); return; }
    Swal.fire({ title: 'Finalizar atención', text: 'Se guardará en el historial clínico y se generará la prefactura.', icon: 'question', showCancelButton: true, confirmButtonText: 'Finalizar' })
      .then((r) => {
        if (!r.isConfirmed) { return; }
        this.guardando = true;
        this.servicio.registrar({ ...this.form, id: this.atencion!.id, tarifaId: this.tarifaId ?? this.atencion!.tarifaId }).subscribe({
          next: () => this.servicio.finalizar(this.atencion!.id!).subscribe({
            next: (a) => { this.atencion = a; this.guardando = false; Swal.fire('Atención finalizada', 'Descargando la prefactura...', 'success'); this.prefactura(); },
            error: (e) => { this.guardando = false; Swal.fire('No se pudo finalizar', e?.error?.message ?? 'Error inesperado', 'error'); }
          }),
          error: (e) => { this.guardando = false; Swal.fire('No se pudo guardar', e?.error?.message ?? 'Error inesperado', 'error'); }
        });
      });
  }

  prefactura() {
    if (!this.atencion?.id) { return; }
    this.servicio.prefacturaPdf(this.atencion.id).subscribe({ next: (b) => abrirPdf(b), error: () => Swal.fire('Error', 'No se pudo generar la prefactura', 'error') });
  }

  formular() {
    this.router.navigate(['/inicio/formulas-medicas'], { queryParams: { citaId: this.cita?.id } });
  }

  volver() { this.router.navigate(['/inicio/atencion-medica']); }
}
