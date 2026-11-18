# src/pages/

Una página por ruta. Todas las páginas (excepto `LoginPage`) son accesibles solo con sesión activa (protegidas por `AuthGate` en `main.jsx`).

## `LoginPage.jsx` — `/login`

Formulario de email + contraseña.

- Llama `signIn(email, password)` del contexto
- Toggle de visibilidad de contraseña
- Muestra mensaje de error si las credenciales son incorrectas
- Nota al pie: los usuarios los crea el coach en Supabase, no hay registro público

---

## `HomePage.jsx` — `/`

Dashboard principal. Muestra el resumen de la rutina activa.

**Requiere:** al menos una rutina con `status === 'active'`

**Contenido:**
- Selector de rutina cuando hay más de una activa
- Estadísticas: sesiones completas, parciales y faltadas
- Porcentaje general de cumplimiento
- Grilla de cumplimiento por semana y día del bloque
- Gráfica de progresión de cargas (Recharts `LineChart`) — máximo peso por ejercicio a lo largo del tiempo
- Dos mapas corporales (`BodyMap`): músculos trabajados hoy y en la semana actual
- Botón "▶ Registrar sesión de hoy"

---

## `SessionPage.jsx` — `/sesion`

Registro de la sesión de entrenamiento del día.

**Flujo:**
1. Selector de día de la rutina activa
2. Si ya registró ese día, muestra aviso de edición
3. Por cada ejercicio del día:
   - Checkbox de completado
   - Expandir para ver detalle (gráfica de progreso, última sesión, tabla de series)
   - Tabla editable: series × reps × peso
   - Agregar / quitar series
   - Toggle de unidad (kg/lb) por ejercicio
   - Muestra PR actual y si el peso actual lo supera (🏆)
4. Timer de descanso (presets 30/60/90/120s)
5. Foto de la sesión (cámara o galería)
6. Botón guardar (muestra %) / actualizar si ya existe
7. Botón compartir imagen de la sesión (canvas 1080×1080 con logo, fecha, ejercicios y pesos)

**Nota:** `genId()` en este archivo usa `Date.now().toString(36)` para IDs de sesión (distinto de las rutinas). Las sesiones no usan columna `uuid` en Supabase — verificar si esto cambia en futuras versiones.

---

## `RoutinePage.jsx` — `/rutina`

Gestión de rutinas (crear, editar, iniciar, eliminar).

**Vistas:**
1. **Lista de rutinas** — tarjetas con nombre, tipo, estado y botones de acción
2. **Selector de tipo** — elige entre tipos de `ROUTINE_TYPES` y presets de `PRESET_ROUTINES`
3. **Configuración (`StepConfigure`)** — nombre, duración, días, ejercicios por día

**Puntos importantes:**
- `genId()` usa `crypto.randomUUID()` — requerido para columnas `uuid` en Supabase
- `handleStart` es `async`, hace `await saveRoutine({ ...routine, status: 'active', startDate })` directamente. No llama `startRoutine` por separado (evita race condition con estado desactualizado)
- El campo del tipo de rutina se guarda como `routineType` en el objeto local; `routineToRow` en AppContext convierte a `routine_type` para Supabase

---

## `HistoryPage.jsx` — `/historial`

Historial de todas las rutinas con sus sesiones.

**Por cada rutina:**
- Nombre, fechas, estado (Activa / Completada / Pausada)
- Contadores: sesiones completas, parciales, faltadas, % general
- Últimas 5 sesiones con fecha, día y resumen de ejercicios (peso máximo por serie)

---

## `ProgressPage.jsx` — `/progreso`

Seguimiento del progreso físico de la rutina activa.

**Contenido:**
- Barra de tiempo transcurrido (días desde `startDate` / duración total)
- Registro de peso corporal inicial y final con diferencia calculada
- Fotos de inicio y fin (guardadas como base64 en la rutina)
- Botón "Marcar como completada" (aparece al llegar al 80% del tiempo)

---

## `CatalogPage.jsx` — `/catalogo`

Gestión del catálogo de ejercicios.

**Dos pestañas:**
1. **Mis ejercicios** — ejercicios personalizados del usuario (CRUD completo). Se guardan en `localStorage`
2. **Pre-cargados** — catálogo de `EXERCISES` (solo lectura)

**Funciones:**
- Crear ejercicio: nombre, grupo muscular, descripción opcional
- Editar y eliminar ejercicios personalizados
- Filtrar por grupo muscular en ambas pestañas

---

## `SharePage.jsx` — `/compartir`

Interfaz de compartir rutinas entre coach y cliente.

**Dos pestañas:**

**Enviar:**
- Seleccionar rutina propia del dropdown
- Ingresar email del destinatario
- Llama `shareRoutine(routineId, toEmail)` — crea snapshot de la rutina en Supabase

**Recibidas:**
- Lista de invitaciones recibidas (donde `to_email` = email del usuario)
- Muestra nombre de la rutina, quien la envió, y estado (pendiente / aceptada / rechazada)
- Aceptar → copia la rutina al perfil del usuario como nueva rutina
- Rechazar → marca la invitación como rechazada
