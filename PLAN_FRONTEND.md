# Plan de trabajo – Frontend (Examen Final Programación Web Full Stack)

**Responsable:** Desarrollador Frontend
**Proyecto:** `frontend26-83682` (Angular 19, plantilla Datta Able, SweetAlert2)
**Documento base:** `../EXAMEN FINAL.pdf`
**Trabaja en paralelo con:** Backend (`../backend2026-83682/PLAN_BACKEND.md`) y Documentación (`../PLAN_DOCUMENTACION.md`)

---

## 1. Punto de partida (estado actual)

| Existe | No existe todavía |
|---|---|
| Páginas en `src/app/demo/pages/`: usuario, cliente, mascota, raza, medico, especializacion, cita, historia-medica, anotacion-historia, medicamento, formula-medica | Login, guards de ruta y menú por rol |
| Un `service/` por página, modelos en `src/app/models/`, `backend.service.ts`, `headers.interceptor.ts` | Calendario de citas |
| Componentes compartidos: `tabla-listado`, `paginador`, `spinner` | Módulos: inventario ampliado, carga masiva, atención médica, facturación, tarifas, reportes, despacho |
| Rutas en `app-routing.module.ts` (11 páginas) | Descarga de PDF/Excel, Dockerfile del frontend |

**Librerías a evaluar:** un calendario (`angular-calendar` o `@fullcalendar/angular`, compatible con Angular 19) y, si se necesita, `ngx-pagination`/similar. Reutilizar `tabla-listado` y `paginador` en todos los módulos nuevos para mantener consistencia.

---

## 2. Reglas de trabajo

- Estructura por módulo: `demo/pages/<modulo>/<modulo>.component.{ts,html}` + `service/<modulo>.service.ts` + modelos en `models/`.
- Formularios con **Reactive Forms**; validar en el cliente (obligatorios, rangos, fechas) **y** mostrar los errores que devuelve el backend con SweetAlert2 en lenguaje entendible (sin mensajes técnicos).
- La URL base y el token salen de `environment*.ts` y del interceptor, no hardcodeados.
- **Los permisos reales viven en el backend**; el frontend solo oculta menú y rutas por rol y maneja el 403 con un mensaje claro.
- Diseño **responsive** (requisito explícito del enunciado) y estados de carga/vacío/error en cada pantalla.
- TsDoc en componentes, servicios y modelos nuevos.
- No esperar al backend: arrancar con **datos simulados** (mocks) según el contrato de la API que Backend publique, y cambiar a la API real cuando esté lista.

---

## 3. Fases y tareas

### Fase 0 – Base: sesión, roles y navegación

- [ ] Pantalla de **login** (layout `guest`) y servicio de autenticación; guardar token y rol.
- [ ] Ampliar `headers.interceptor.ts` para enviar el token y redirigir al login si llega 401; mostrar aviso en 403.
- [ ] **Guards** de ruta por rol y **menú dinámico** (qué ve cada rol):

| Rol | Menú visible |
|---|---|
| `ADMIN` | Todo (incluye tarifas, reportes, usuarios, inventario completo, citas completas) |
| `SECRETARIA` | Citas (módulo completo), clientes, mascotas, facturación |
| `MEDICO` | **Nuevo** módulo de calendario de citas propio, atención médica, fórmulas |
| `DESPACHO_MEDICO` | Solo inventario (solo lectura) y despacho |

- [ ] Utilidad común para descargar archivos (`Blob`) PDF/Excel con el token.
- [ ] `Dockerfile` (build Angular + nginx) y servicio `frontend` en `docker-compose.yml` (coordinar con Backend).

### Fase 1 – Requerimiento 1: Inventario y carga masiva (20 %)

Páginas: `inventario` (reemplaza/amplía `medicamento`), `inventario/carga-masiva`.

- [ ] **Listado** con búsqueda, filtros y paginación: cantidad disponible, precio de compra y de venta, estado del stock, vencimiento.
- [ ] **Indicadores visuales:** agotado, stock bajo, próximo a vencer, vencido (badges de color).
- [ ] **Formulario** crear/editar: nombre, descripción, presentación, código de 8 caracteres, **Registro Invima** (obligatorio solo si es medicamento; opcional si es utensilio), precios, stock actual/mínimo, fecha de ingreso, fecha del próximo pedido.
- [ ] Gestión de **lotes** por medicamento (lote, cantidad, precio de compra, vencimiento) y vista del **historial de movimientos** (entradas/salidas).
- [ ] **Carga masiva** en pasos:
  1. Seleccionar archivo `.xlsx`/`.csv` (con enlace para descargar la plantilla).
  2. **Vista previa:** tabla con filas válidas y filas con error (fila + motivo).
  3. **Confirmar** importación de las válidas.
  4. Descargar **informe de errores** y ver el **log de cargas** (usuario, fecha, totales).
- [ ] Probar con un archivo de más de 50 registros (evidencia para el entregable 3).

### Fase 2 – Requerimiento 2: Citas con calendario (20 %)

- [ ] Instalar e integrar el calendario con vistas **día, semana y mes**.
- [ ] **Perfil MEDICO:** ve el *nuevo* módulo de calendario con **sus** citas. **SECRETARIA/ADMIN:** ven el módulo de citas ya desarrollado (listado/gestión) — respetar esta diferenciación por rol en el menú y en la ruta.
- [ ] Colores por estado (pendiente, confirmada, atendida, cancelada, finalizada) y leyenda.
- [ ] Al hacer clic en una cita: modal con propietario, datos de la mascota, motivo, fecha/hora de inicio y fin.
- [ ] **Registrar/editar cita** (formulario reactivo; combos dependientes propietario → mascota; veterinario y horario disponible), marcar como atendida, cancelar con motivo, **reprogramar** (arrastrar o editar fecha/hora) mostrando el error de solapamiento o de horario no disponible que devuelve el backend.
- [ ] Historial de citas de una mascota.
- [ ] **Reporte Excel** de citas del médico con filtro fecha inicio/fin y botón de descarga.
- [ ] Resumen por estado (pendientes/confirmadas/canceladas/finalizadas).
- [ ] Pantalla de **horarios de disponibilidad** del veterinario (admin).

### Fase 3 – Requerimiento 3: Atención, fórmulas y facturación (20 %)

- [ ] **Especialidades y tarifas** (admin): CRUD, activar/inactivar, valor de consulta, IVA, tarifas por especialidad/servicio, vista del **log de cambios de tarifas**.
- [ ] **Pantalla de atención médica** (MEDICO) abierta desde una cita: datos de la mascota, antecedentes médicos, y campos de motivo, síntomas, diagnóstico, observaciones, recomendaciones; botón **Finalizar atención** (genera la **prefactura PDF**).
- [ ] **Fórmula médica:** seleccionar uno o varios medicamentos, ver disponibilidad en inventario, registrar dosis, frecuencia, duración, cantidad, vía de administración e indicaciones especiales; **generar/imprimir PDF**. Dejar claro en la UI que formular **no** descuenta inventario.
- [ ] **Facturación:** generar factura desde una atención finalizada, vista previa con subtotal, IVA, descuentos y total; descargar PDF; **registrar pagos** (parcial/total) y mostrar el estado: Pendiente, Parcial, Pagada, Anulada; **anular** con confirmación y motivo.
- [ ] Historial de facturación por propietario y por mascota.

### Fase 4 – Requerimiento 5: Despacho de medicamentos (20 %)

Visible **solo** para `DESPACHO_MEDICO` (y bloqueado por guard + backend).

- [ ] **Bandeja de fórmulas pendientes:** id, fecha, veterinario, propietario, mascota, estado del despacho; búsqueda por id, propietario, mascota o fecha.
- [ ] **Detalle de despacho:** medicamentos prescritos con cantidad, dosis, frecuencia, duración e indicaciones (**solo lectura**: el despachador no modifica dosis ni cantidades), existencias, lotes disponibles, alertas de vencido / próximo a vencer / sin existencias.
- [ ] **Selección de lotes** (sugerencia con el de vencimiento más cercano y vigente), captura de **cantidad efectivamente entregada**; impedir en pantalla entregar más de lo disponible y permitir **despacho parcial**.
- [ ] **Confirmar entrega** con diálogo de confirmación; mostrar resultado, estado final (En preparación, Parcial, Despachado, Pendiente por disponibilidad, Cancelado) y descargar el **comprobante PDF**.
- [ ] **Historial de despachos** (log por fórmula, por medicamento, usuario, fecha, lotes, cantidades, estado) y cancelación autorizada.
- [ ] Inventario visible para este perfil en **solo lectura** (sin botones de crear/editar/eliminar).

### Fase 5 – Requerimiento 4: Reportes (10 %)

Una sola pantalla `reportes` (solo admin / roles autorizados) con pestañas **Financieros**, **Inventario** y **Gestión médica**.

- [ ] Formulario común: **rango de fechas** + filtros propios de cada reporte.
- [ ] **Previsualizar** en tabla (con totales) antes de exportar.
- [ ] Botones **Descargar PDF** y **Descargar Excel**.
- [ ] Gráficos simples opcionales (ingresos por período) con las librerías que ya trae la plantilla.
- [ ] Verificar que los totales coinciden entre reportes y con las facturas.

### Fase 6 – Cierre

- [ ] Revisar responsive en móvil/tablet/escritorio en todos los módulos.
- [ ] Prueba end-to-end con cada rol: login → qué ve y qué no ve → flujo completo (carga masiva → cita → atención → fórmula → despacho → factura → pago → reporte).
- [ ] Capturas/grabación de cada evidencia solicitada (ver `../PLAN_DOCUMENTACION.md`).
- [ ] TsDoc en todos los componentes/servicios nuevos; eliminar demos no usadas de la plantilla si estorban.
- [ ] `ng build` sin errores/warnings relevantes y `docker compose up --build` funcionando.

---

## 4. Dependencias con el Backend (qué esperar y cuándo)

| Frontend necesita | De Backend | Fase |
|---|---|---|
| Login, token y rol | Fase 0 | 0 |
| Endpoints de inventario, lotes y carga masiva (previsualizar/confirmar) | Fase 1 | 1 |
| `GET /cita/calendario` y reglas de cita | Fase 2 | 2 |
| Tarifas, atención, fórmula, factura y PDF | Fase 3 | 3 |
| Despacho y comprobante PDF | Fase 4 | 4 |
| Endpoints de reportes con `?formato=pdf|xlsx` | Fase 5 | 5 |

Mientras tanto: usar mocks siguiendo el contrato y Swagger.

## 5. Entregables del Frontend

1. Código fuente Angular con los 5 módulos y control de acceso por rol.
2. Interfaces responsive y funcionales conectadas a la API.
3. Dockerfile y servicio en `docker-compose.yml`.
4. Evidencias en pantalla (capturas) de los flujos clave, entregadas a Documentación.

## 6. Qué necesita Documentación de ti

| Cuándo | Qué entregar |
|---|---|
| Fase 0 | Mapa de rutas y qué ve cada rol (para el manual y las credenciales por rol) |
| Al terminar cada módulo | Capturas de las pantallas principales y de los flujos de error más relevantes |
| Fase 6 | Evidencias: carga masiva 50+, calendario de citas, fórmula y factura PDF, reportes PDF/Excel, dispensación |
