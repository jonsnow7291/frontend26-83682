import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { LoginComponent } from './demo/pages/login/login.component';
import { SinPermisoComponent } from './demo/pages/sin-permiso/sin-permiso.component';
import { AuthGuard } from './guards/auth.guard';
import { RolGuard } from './guards/rol.guard';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component';
import { RazaComponent } from './demo/pages/raza/raza.component';
import { MedicoComponent } from './demo/pages/medico/medico.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';
import { AnotacionHistoriaComponent } from './demo/pages/anotacion-historia/anotacion-historia.component';
import { MedicamentoComponent } from './demo/pages/medicamento/medicamento.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';
import { InventarioComponent } from './demo/pages/inventario/inventario.component';
import { CargaMasivaComponent } from './demo/pages/inventario/carga-masiva/carga-masiva.component';
import { CalendarioComponent } from './demo/pages/calendario/calendario.component';
import { AtencionMedicaComponent } from './demo/pages/atencion-medica/atencion-medica.component';
import { FacturaComponent } from './demo/pages/factura/factura.component';
import { ReportesComponent } from './demo/pages/reportes/reportes.component';
import { DespachoComponent } from './demo/pages/despacho/despacho.component';

/**
 * Rutas de la aplicación: cada módulo de gestión cuelga de `/inicio`.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: 'sin-permiso', component: SinPermisoComponent, data: { title: 'Sin permiso' } },
  {
    path: 'inicio',
    component: AdminComponent,
    data: { title: 'Inicio' },
    canActivate: [AuthGuard],
    children: [
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes', roles: ['ADMIN', 'SECRETARIA'] }, canActivate: [RolGuard] },
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas', roles: ['ADMIN', 'SECRETARIA'] }, canActivate: [RolGuard] },
      { path: 'razas', component: RazaComponent, data: { title: 'Razas', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'medicos', component: MedicoComponent, data: { title: 'Médicos', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'citas', component: CitaComponent, data: { title: 'Citas', roles: ['ADMIN', 'SECRETARIA'] }, canActivate: [RolGuard] },
      { path: 'historias-medicas', component: HistoriaMedicaComponent, data: { title: 'Historias Médicas', roles: ['ADMIN', 'MEDICO', 'SECRETARIA'] }, canActivate: [RolGuard] },
      { path: 'anotaciones', component: AnotacionHistoriaComponent, data: { title: 'Anotaciones', roles: ['ADMIN', 'MEDICO'] }, canActivate: [RolGuard] },
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'formulas-medicas', component: FormulaMedicaComponent, data: { title: 'Fórmulas Médicas', roles: ['ADMIN', 'MEDICO'] }, canActivate: [RolGuard] },
      { path: 'inventario', component: InventarioComponent, data: { title: 'Inventario', roles: ['ADMIN', 'DESPACHO_MEDICO'] }, canActivate: [RolGuard] },
      { path: 'inventario/carga-masiva', component: CargaMasivaComponent, data: { title: 'Carga masiva', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'calendario', component: CalendarioComponent, data: { title: 'Calendario de citas', roles: ['ADMIN', 'SECRETARIA', 'MEDICO'] }, canActivate: [RolGuard] },
      { path: 'atencion-medica', component: AtencionMedicaComponent, data: { title: 'Atención médica', roles: ['ADMIN', 'MEDICO'] }, canActivate: [RolGuard] },
      { path: 'facturas', component: FacturaComponent, data: { title: 'Facturación', roles: ['ADMIN', 'SECRETARIA'] }, canActivate: [RolGuard] },
      { path: 'reportes', component: ReportesComponent, data: { title: 'Reportes', roles: ['ADMIN'] }, canActivate: [RolGuard] },
      { path: 'despacho', component: DespachoComponent, data: { title: 'Despacho de medicamentos', roles: ['ADMIN', 'DESPACHO_MEDICO'] }, canActivate: [RolGuard] },
      /* Inserte nuevos menus aqui */
    ]
  },
  { path: '**', redirectTo: 'login' }
];

/**
 * Módulo de enrutamiento de la aplicación.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}