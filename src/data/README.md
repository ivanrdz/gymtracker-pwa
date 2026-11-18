# src/data/

Datos estáticos de la aplicación. No se conectan a la base de datos.

## `exercises.js`

Catálogo completo de ejercicios precargados.

**Exporta:**
- `EXERCISES: array` — lista de ejercicios con la forma:
  ```js
  {
    id: string,          // ID único, ej. 'press_banca'
    name: string,        // Nombre en español
    muscle: string,      // ID del grupo muscular (clave de MUSCLE_GROUPS)
    sets: number,        // Series por defecto
    reps: number,        // Repeticiones por defecto
    image?: string,      // Ruta a imagen en /public/images/
    description?: string // Descripción opcional
  }
  ```

- `MUSCLE_GROUPS: object` — mapa de grupos musculares:
  ```js
  {
    pecho:   { label: 'Pecho',    color: '#ef4444' },
    espalda: { label: 'Espalda',  color: '#3b82f6' },
    piernas: { label: 'Piernas',  color: '#22c55e' },
    hombros: { label: 'Hombros',  color: '#f59e0b' },
    biceps:  { label: 'Bíceps',   color: '#8b5cf6' },
    triceps: { label: 'Tríceps',  color: '#ec4899' },
    abdomen: { label: 'Abdomen',  color: '#06b6d4' },
    gluteo:  { label: 'Glúteo',   color: '#f97316' },
  }
  ```

---

## `routines.js`

Tipos de rutina disponibles al crear una nueva rutina.

**Exporta:**
- `ROUTINE_TYPES: object` — cada tipo tiene:
  - `id`, `name`, `emoji`, `description`, `frequency`, `level`
  - `days: array` — días predefinidos con `id`, `label`, `suggestedMuscles`
  - `maxExercisesPerDay: number`

**Tipos disponibles:**
| ID | Nombre | Días | Nivel |
|----|--------|------|-------|
| `full_body` | Full Body | 3 | Principiante |
| `upper_lower` | Upper / Lower | 4 | Intermedio |
| `ppl` | Push / Pull / Legs | 6 | Intermedio–Avanzado |
| `weider` | Rutina Weider | 5 | Avanzado |
| `bloque_compuesto` | Bloque Compuesto | 5 | Intermedio–Avanzado |

---

## `presetRoutines.js`

Rutinas listas para usar que el usuario puede cargar directamente.

**Exporta:**
- `PRESET_ROUTINES: array` — cada preset tiene la misma forma que una rutina guardada (con días y ejercicios completos)

**Presets incluidos:**
- `preset_compuestos_5dias` — Bloque de 5 días de ejercicios compuestos:
  - **Lun:** Glúteo (sentadilla, peso muerto rumano, hip thrust, etc.)
  - **Mar:** Torso A (press banca, jalón, press hombro, etc.) con superseries
  - **Mié:** Cuádriceps (prensa, hack squat, extensiones, etc.)
  - **Jue:** Torso B (press inclinado, remo, fondos, etc.) con superseries
  - **Vie:** Pierna general (sentadilla búlgara, peso muerto, saltos con trap bar)
  - Incluye notas de técnica, tempos, pausas y progresión de 4 semanas en el campo `notes` de cada ejercicio

**Nota:** Los ejercicios de los presets usan IDs del catálogo `EXERCISES`. Si se agrega un ejercicio nuevo al preset que no existe en el catálogo, debe agregarse primero en `exercises.js` o como `custom_*` en el preset mismo.
