# src/components/ui/

Componentes visuales reutilizables sin lógica de negocio.

## `BodyMap.jsx`

Visualización anatómica SVG de un cuerpo humano con músculos resaltados.

**Props:**
- `activeMuscles: string[]` — lista de IDs de grupos musculares a resaltar (ej. `['pecho', 'triceps']`)
- `title: string` — título opcional que aparece encima del mapa

**Comportamiento:**
- Renderiza dos vistas: frontal y posterior
- Resalta los músculos activos con el color definido en `MUSCLE_GROUPS` (de `exercises.js`)
- Muestra leyenda de músculos resaltados debajo del SVG

**Uso típico:**
```jsx
<BodyMap activeMuscles={['piernas', 'abdomen']} title="🔴 Hoy" />
```

Usado en `HomePage` para mostrar músculos trabajados hoy y en la semana.

---

## `ExerciseChart.jsx`

Gráfica de línea que muestra la progresión de peso máximo de un ejercicio a lo largo del tiempo.

**Props:**
- `history: array` — array de `{ date, maxWeight, unit }` generado por `getExerciseHistory(exerciseId)` del contexto

**Comportamiento:**
- No renderiza nada si `history` tiene menos de 2 puntos (sin datos suficientes para una línea)
- Usa Recharts (`LineChart`) con gradiente índigo→rosa
- Tooltip personalizado que muestra fecha y peso con unidad

**Uso típico:**
```jsx
<ExerciseChart history={getExerciseHistory(ex.id)} />
```

Usado en `SessionPage` dentro del detalle expandido de cada ejercicio.

---

## `ThemeToggle.jsx`

Botón para alternar entre tema oscuro y claro.

**Comportamiento:**
- Muestra ☀️ (sol) cuando el tema actual es oscuro
- Muestra 🌙 (luna) cuando el tema actual es claro
- Llama `toggleTheme()` del contexto al hacer click

**Uso:**
```jsx
<ThemeToggle />
```

Usado en el sidebar del Layout.
