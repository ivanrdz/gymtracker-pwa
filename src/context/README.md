# src/context/

Estado global de la aplicación mediante React Context API.

## `AppContext.jsx`

Proveedor central (`AppProvider`) que maneja todo el estado y la lógica de negocio. Se consume en cualquier componente con `useApp()`.

### Estado expuesto

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `user` | objeto / null | Usuario autenticado (Supabase Auth) |
| `authLoading` | boolean | True mientras Supabase verifica la sesión al inicio |
| `dataLoading` | boolean | True mientras se cargan rutinas/sesiones del servidor |
| `routines` | array | Todas las rutinas del usuario |
| `sessions` | array | Todas las sesiones registradas |
| `theme` | 'dark' \| 'light' | Tema visual actual (persiste en localStorage) |
| `unit` | 'kg' \| 'lb' | Unidad de peso global (persiste en localStorage) |
| `customExercises` | array | Ejercicios creados por el usuario (persiste en localStorage) |

### Funciones de autenticación

- `signIn(email, password)` — llama a `supabase.auth.signInWithPassword`
- `signOut()` — llama a `supabase.auth.signOut` y limpia el estado

### Flujo de autenticación

1. Al montar, `getSession()` verifica si hay sesión activa (`authLoading = true`)
2. `onAuthStateChange` escucha cambios: login → llama `loadData(uid)`; logout → limpia estado
3. `loadData` hace fetch paralelo de rutinas y sesiones del usuario desde Supabase

### Funciones de rutinas

- `saveRoutine(routine)` — crea o actualiza (upsert). Actualiza estado local optimistamente, luego sincroniza con Supabase
- `deleteRoutine(id)` — elimina localmente y en Supabase
- `startRoutine(id)` — cambia `status` a `'active'` usando actualización funcional para evitar stale closure
- `completeRoutine(id, endWeight)` — cambia `status` a `'completed'`
- `getActiveRoutines()` — devuelve todas las rutinas con `status === 'active'`
- `getActiveRoutine()` — devuelve la primera rutina activa

### Funciones de sesiones

- `saveSession(session)` — crea o actualiza una sesión. Calcula `completionPct` automáticamente
- `getRoutineSessions(routineId)` — filtra sesiones por rutina
- `getLastExerciseRecord(exerciseId)` — último registro de un ejercicio en cualquier sesión
- `getExerciseHistory(exerciseId)` — historial de peso máximo por sesión para gráficas
- `getExercisePR(exerciseId)` — récord personal (máximo peso registrado)

### Funciones de ejercicios personalizados

- `saveCustomExercise(ex)` — crea o edita un ejercicio en localStorage
- `deleteCustomExercise(id)` — elimina de localStorage

### Funciones de compartir rutinas

- `shareRoutine(routineId, toEmail)` — crea un registro en `gymtracker.routine_shares` con snapshot de la rutina
- `getReceivedShares()` — obtiene las invitaciones recibidas (donde `to_email` = email del usuario)
- `acceptShare(shareId, snapshot)` — crea una copia de la rutina en el perfil del usuario desde la snapshot
- `rejectShare(shareId)` — marca la invitación como rechazada

### Patrón de conversión Supabase ↔ Estado local

Las rutinas se almacenan en Supabase con estructura plana. Los convertidores manejan la traducción:

```js
// Local → Supabase
routineToRow(routine, userId) => { id, user_id, name, status, routine_type, routine_data }

// Supabase → Local
rowToRoutine(row) => { ...row.routine_data, id, name, status, type, routineType }
```

**Nota crítica:** `type` y `routineType` se devuelven ambos para compatibilidad con distintas partes del código que usan uno u otro.

### Notas de implementación

- Todos los IDs nuevos se generan con `crypto.randomUUID()` — requerido por las columnas `uuid` de Supabase
- Las preferencias de tema y unidad usan `localStorage` (no Supabase) ya que son preferencias de dispositivo
- Los ejercicios personalizados usan `localStorage` (no hay tabla en Supabase para ellos aún)
