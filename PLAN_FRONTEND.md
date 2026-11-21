# Plan de trabajo – Frontend (Examen Final Programación Web Full Stack)

**Responsable:** Desarrollador Frontend
**Proyecto:** `frontend26-83682` (Angular 19, plantilla Datta Able, SweetAlert2)
**Documento base:** `../EXAMEN FINAL.pdf`
**Rama de trabajo:** `1016004-JDCHAPARRO` · **Última revisión:** 2026-11-20
**Trabaja en paralelo con:** Backend (`../backend2026-83682/PLAN_BACKEND.md`) y Documentación (`../PLAN_DOCUMENTACION.md`)

---

## 0. Hallazgo de la revisión (2026-11-20)

El primer commit del plan dejó pantallas **construidas sobre un contrato supuesto** (rutas como `inventario/listar`, `atencion-medica/*`, `factura/pago`, `reportes/obtener`, login simulado con contraseñas inventadas, descargas sin `responseType: blob`). Ninguna coincidía con el backend real. Además faltaban tarifas, horarios y el registro de especialidades, el menú no filtraba por rol, el ADMIN veía despacho (prohibido por la regla 5.8‑1) y la pantalla de fórmulas seguía en el modelo de un solo medicamento. **Todo se reescribió contra los endpoints reales** (ver `../backend2026-83682/PLAN_BACKEND.md` §7 y Swagger).

> Regla para no repetirlo: **no se escribe un servicio sin abrir antes el `*Api.java` y el DTO del backend**; los modelos de `src/app/models/` copian los DTOs.

## 1. Punto de partida (estado actual)

Angular 19 con la plantilla Datta Able. Páginas en `src/app/demo/pages/`, servicios por página, modelos en `src/app/models/`, `BackendService` (con `getBlob` para descargas), `AuthService`, interceptor, guards (`AuthGuard`, `RolGuard`). **No se usó librería de calendario**: el calendario día/semana/mes es propio (sin dependencias nuevas). Los formularios nuevos usan `ngModel` con validación en el cliente (los antiguos usan Reactive Forms); el backend revalida siempre.

## 2. Reglas de trabajo

- Estructura por módulo: `demo/pages/<modulo>/<modulo>.component.{ts,html}` + `service/<modulo>.service.ts` + modelos en `models/`.
- Validar en el cliente (obligatorios, rangos, fechas) **y** mostrar el mensaje que devuelve el backend con SweetAlert2 en lenguaje entendible.
- URL base y token: `environment*.ts` y `AuthService`; nada hardcodeado.
- **Los permisos reales viven en el backend**; el frontend solo oculta menú/rutas por rol y maneja 401/403.
- Diseño responsive con Bootstrap (grilla, tablas `table-responsive`, modales); estados de carga/vacío/error en cada pantalla.
- TsDoc en componentes, servicios y modelos nuevos.

## 3. Fases y estado

### Fase 0 – Sesión, roles y navegación
- [x] **Login real** (`POST /auth/login`), token y rol en `localStorage` (usuarios de prueba: ver documentación técnica).
- [x] Interceptor: token en cada petición; 401 → login; 403 → `/sin-permiso`.
- [x] Guards de ruta por rol y **menú dinámico** (`NavigationItem.roles`, filtrado en `nav-content`):

| Rol | Menú visible |
|---|---|
| `ADMIN` | Usuarios, clientes, mascotas, razas, médicos, especialidades, tarifas, horarios, citas (módulo de gestión), atención, historias, anotaciones, fórmulas, inventario, carga masiva, facturación, reportes. **No ve despacho ni el calendario del médico.** |
| `SECRETARIA` | Clientes, mascotas, citas (módulo de gestión), historias (consulta), facturación |
| `MEDICO` | **Mi calendario de citas** (módulo nuevo), atención médica, historias, anotaciones, fórmulas |
| `DESPACHO_MEDICO` | **Solo** inventario (solo lectura) y despacho |

- [x] Descarga de archivos con token (`BackendService.getBlob` + `utils/descarga.ts`).
- [x] `Dockerfile` (node → nginx con fallback de SPA), `nginx.conf`, `.dockerignore`; servicio `frontend` en el `docker-compose.yml` de la **carpeta raíz** (`include` del compose del backend).

### Fase 1 – Inventario y carga masiva (20 %)
- [x] Listado con búsqueda, filtros (agotados, stock bajo, próximos a vencer, vencidos, tipo) y paginación; badges de estado.
- [x] Formulario: código de 8 caracteres, Invima obligatorio solo para medicamento, precios, IVA, stock mínimo, próximo pedido; activar/inactivar.
- [x] Lotes por producto (con vigencia; utensilios sin vencimiento) y entrada de lote; historial de movimientos.
- [x] Solo lectura para `DESPACHO_MEDICO` (se ocultan crear/editar/entradas).
- [x] Carga masiva en pasos: plantilla `.xlsx`/`.csv` → archivo → vista previa (válidas / con error, fila + motivo) → confirmar → informe de errores y log de cargas.
- [x] Archivo de prueba de 62 registros (52 válidos, 10 con error deliberado) en `../docs/evidencias/`; verificado contra la API.
- [ ] Probar la pantalla en el navegador con ese archivo y capturar la evidencia 1.

### Fase 2 – Citas con calendario (20 %)
- [x] Calendario propio con vistas **día, semana y mes**, navegación y «Hoy»; datos de `GET /cita/calendario`.
- [x] `MEDICO` ve **su** módulo de calendario; `SECRETARIA`/`ADMIN` conservan el módulo de gestión de citas (su estado se corrigió a los valores del backend en mayúsculas).
- [x] Colores por estado + leyenda + resumen por estado del rango (`/cita/resumen`).
- [x] Modal con propietario, mascota, motivo, inicio y fin; acciones: confirmar, marcar atendida, cancelar con motivo, **reprogramar** (fecha/hora/duración con el error de solapamiento u horario que devuelve el backend), editar, historial de citas de la mascota, abrir atención.
- [x] Nueva cita (propietario → mascota dependientes; el médico es el de la sesión).
- [x] Reporte Excel con filtro de fechas.
- [x] Pantalla de **horarios de disponibilidad** (CRUD por veterinario).
- [ ] Reprogramar arrastrando la cita (hoy se reprograma desde el modal; el enunciado solo exige poder cambiar fecha y hora).

### Fase 3 – Atención, fórmulas y facturación (20 %)
- [x] **Especialidades:** registro, edición y activar/inactivar.
- [x] **Tarifas:** CRUD por especialidad y servicio (valor, IVA), activar/inactivar, historial de cambios.
- [x] **Atención médica** abierta desde la cita: datos de la mascota, antecedentes (atenciones previas), motivo, síntomas, diagnóstico, observaciones, recomendaciones, finalizar → prefactura PDF.
- [x] **Fórmulas:** varios medicamentos, disponibilidad visible, dosis/frecuencia/duración/vía/indicaciones, **cantidad calculada** (unidades × tomas/día × días), guardar como borrador, **confirmar** (solo médico), PDF. La pantalla avisa que formular no descuenta inventario.
- [x] **Facturación:** generar desde cita atendida (descuento solo visible para ADMIN), detalle con subtotal/IVA/descuento/total, pagos parciales o totales, estados Pendiente/Parcial/Pagada/Anulada, anular con motivo, PDF.
- [x] Historial de facturación por propietario y por mascota.

### Fase 4 – Despacho (20 %)
Visible **solo** para `DESPACHO_MEDICO` (guard + backend).
- [x] Bandeja de pendientes con búsqueda por n.º de fórmula, propietario, mascota y fecha; pestaña de historial.
- [x] Detalle en solo lectura de lo prescrito; existencias, lotes con alertas (vigente / por vencer / vencido) y aviso de sin existencias.
- [x] Iniciar preparación (lotes FEFO asignados automáticamente), cantidad entregada por línea limitada a lo pendiente y disponible (**entrega parcial**), confirmar con diálogo, comprobante PDF.
- [x] Cancelar y reversar con la autorización (usuario y contraseña) de un ADMIN; historial de estados.
- [ ] Vista de historial de dispensaciones **por medicamento** (el servicio `historialMedicamento` está listo; falta la pantalla).

### Fase 5 – Reportes (10 %)
- [x] Pantalla única con pestañas Financieros / Inventario / Gestión médica; rango de fechas y filtros propios (veterinario, especialidad, medicamento, agrupación día/mes/año); **previsualización con totales**; descarga PDF y Excel.
- [ ] Gráficos (opcionales).

### Fase 6 – Cierre
- [x] `ng build` en desarrollo y en producción sin errores.
- [x] Prueba en navegador (Chromium) de: login real, menú de `despacho`, `admin` y `medico1`, redirección a `/sin-permiso` al abrir despacho como ADMIN, flujo completo de despacho (preparar → lotes FEFO → entrega → bitácora), calendario mensual del médico y pantalla de reportes. Sin errores de consola.
- [ ] Prueba en navegador **pendiente** de: carga masiva, fórmulas (borrador → confirmar), atención, facturación y pagos, tarifas, horarios, especialidades, reportes con datos, y los menús de `secretaria`.
- [ ] Revisión responsive en móvil/tablet/escritorio.
- [ ] Capturas de las 5 evidencias (ver `../PLAN_DOCUMENTACION.md`).
- [ ] TsDoc completo (hay en servicios y componentes nuevos; falta repasar los heredados).
- [ ] `docker compose up --build` de punta a punta (el compose está validado con `docker compose config`; no se pudo ejecutar porque el daemon de Docker no estaba activo en la máquina de desarrollo).

---

## 4. Dependencias con el Backend

| Frontend necesita | Endpoint real |
|---|---|
| Login | `POST /auth/login` |
| Inventario | `/medicamento/*`, `/inventario/lotes`, `/inventario/entrada`, `/inventario/movimientos` |
| Carga masiva | `/inventario/carga-masiva/plantilla`, `previsualizar`, `confirmar`, `{id}/errores` y `GET /inventario/carga-masiva` |
| Citas | `/cita/calendario`, `resumen`, `reporte-excel`, `confirmar`, `atender`, `cancelar`, `reprogramar`, `historial-mascota` |
| Especialidades, tarifas, horarios | `/especializacion/*`, `/tarifa/*`, `/horario-veterinario/*` |
| Atención, fórmulas | `/atencion/*`, `/formula-medica/*` (incluye `/{id}/confirmar`) |
| Facturación | `/factura/*`, `/pago/registrar` |
| Despacho | `/despacho/*` |
| Reportes | `GET /reportes/{tipo}?formato=json`, `pdf` o `xlsx` |

## 5. Entregables del Frontend

1. Código fuente Angular con los módulos y control de acceso por rol.
2. Interfaces conectadas a la API real.
3. Dockerfile y servicio en el compose raíz.
4. Evidencias en pantalla (capturas), entregadas a Documentación.

## 6. Qué necesita Documentación de ti

| Cuándo | Qué entregar |
|---|---|
| Ahora | Mapa de rutas y qué ve cada rol (tabla de la Fase 0 y `app-routing.module.ts`) |
| Al probar en navegador | Capturas de las pantallas principales y de los errores relevantes (solapamiento de cita, stock insuficiente, descuento no autorizado) |
| Cierre | Evidencias: carga masiva 62 filas, calendario, fórmula y factura PDF, reportes PDF/Excel, dispensación |
