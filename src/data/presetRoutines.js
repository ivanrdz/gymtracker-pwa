import { EXERCISES } from './exercises'

const find = (id) => EXERCISES.find(e => e.id === id)
const ex = (id, sets, reps) => { const b = find(id); return b ? { ...b, sets, reps } : null }
const clean = (arr) => arr.filter(Boolean)

export const PRESET_ROUTINES = [
  // ─────────────────────────────────────────────────────────────
  //  RUTINA 1 — 6 DÍAS (Dady Aioly)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'preset_dady_6dias',
    name: 'Rutina 6 días — Dady Aioly',
    emoji: '🏆',
    description: 'Rutina de alta frecuencia dividida por grupo muscular: cuádriceps, femoral y glúteos en días separados.',
    frequency: '6 días/semana',
    level: 'Avanzado',
    days: [
      {
        id: 'r1d1',
        label: 'Lunes — Pierna (Cuádriceps)',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi10', 3, 15),  // Extensión pantorrilla
          ex('pi12', 3, 15),  // Adductores
          ex('pi3',  3, 12),  // Extensión pierna (drop-set)
          ex('pi1',  3, 10),  // Sentadilla Smith
          ex('pi14', 3, 10),  // Sentadilla Hack (Perfecta)
          ex('pi2',  3, 10),  // Prensa Sumo
        ]),
      },
      {
        id: 'r1d2',
        label: 'Martes — Pecho, Hombro y Tríceps',
        suggestedMuscles: ['pecho', 'hombros', 'triceps'],
        exercises: clean([
          ex('pe2',  3, 10),  // Press inclinado
          ex('pe4',  3, 10),  // Low Flys polea
          ex('pe1',  3, 10),  // Press plano
          ex('pe11', 3, 12),  // Pec-deck
          ex('pe7',  3, 10),  // Cross-overs
          ex('ho10', 3, 10),  // Press hombro máquina
          ex('ho3',  3, 12),  // Laterales mancuerna
          ex('tr2',  3, 12),  // Extensión tríceps soga
        ]),
      },
      {
        id: 'r1d3',
        label: 'Miércoles — Pierna (Femoral)',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi10', 3, 12),  // Pantorrilla costurera
          ex('pi12', 3, 15),  // Adductores
          ex('pi11', 3, 10),  // Femoral sentado (drop-set)
          ex('pi4',  3, 10),  // Femoral acostado
          ex('pi15', 3, 10),  // Femoral unilateral
          ex('es6',  3, 10),  // Peso muerto
        ]),
      },
      {
        id: 'r1d4',
        label: 'Jueves — Espalda, Hombro y Bíceps',
        suggestedMuscles: ['espalda', 'hombros', 'biceps'],
        exercises: clean([
          ex('es2',  3, 10),  // Jalón al pecho
          ex('es11', 3, 10),  // Jalón triángulo
          ex('es5',  3, 10),  // Remo polea
          ex('es7',  3, 10),  // Remo respaldo (máquina)
          ex('es3',  3, 10),  // Remo barra
          ex('es8',  3, 10),  // Pull-overs
          ex('es13', 3, 15),  // Hiperextensión
          ex('ho5',  3, 12),  // Flys posterior + laterales
          ex('bi8',  3, 10),  // Curl barra Z
        ]),
      },
      {
        id: 'r1d5',
        label: 'Viernes — Pierna (Glúteos)',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi10', 3, 12),  // Pantorrilla
          ex('pi12', 3, 15),  // Adductores
          ex('pi8',  4, 10),  // Hip-thrust
          ex('pi1',  3, 10),  // Sentadilla Sumo (Smith)
          ex('pi13', 3, 10),  // Patadas glúteo
          ex('pi9',  3, 15),  // Abductores
        ]),
      },
      {
        id: 'r1d6',
        label: 'Sábado — Brazos (Hombro + Bíceps + Tríceps)',
        suggestedMuscles: ['hombros', 'biceps', 'triceps'],
        exercises: clean([
          ex('ho5',  3, 12),  // Hombro posterior (triset)
          ex('ho3',  3, 12),  // Laterales (triset)
          ex('ho4',  3, 12),  // Frontales (triset)
          ex('ho10', 3, 10),  // Press hombro
          ex('bi6',  3, 10),  // Predicador
          ex('bi2',  3, 10),  // Curls mancuerna
          ex('bi7',  3, 10),  // Curl inclinado
          ex('tr2',  3, 10),  // Extensión soga
          ex('tr11', 3, 10),  // Copa soga
          ex('tr8',  3, 12),  // Fondos
        ]),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  RUTINA 2 — ARNOLD SPLIT (Dady Aioly)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'preset_dady_arnold',
    name: 'Arnold Split — Dady Aioly',
    emoji: '💪',
    description: 'Clásico Arnold Split de 3 días repetidos dos veces por semana. Pecho+Espalda / Hombros+Brazos / Pierna.',
    frequency: '6 días/semana',
    level: 'Intermedio-Avanzado',
    days: [
      {
        id: 'r2d1',
        label: 'Lunes / Jueves — Pecho y Espalda',
        suggestedMuscles: ['pecho', 'espalda'],
        exercises: clean([
          ex('pe2',  3, 10),  // Press inclinado Smith
          ex('pe1',  3, 10),  // Press plano barra
          ex('pe7',  3, 10),  // Cross-overs
          ex('pe11', 3, 10),  // Flys pec-deck
          ex('es2',  3, 10),  // Jalón al pecho
          ex('es11', 3, 10),  // Jalón triángulo
          ex('es5',  3, 10),  // Remo máquina polea
          ex('es3',  3, 10),  // Remo barra
        ]),
      },
      {
        id: 'r2d2',
        label: 'Martes / Viernes — Hombro, Bíceps y Tríceps',
        suggestedMuscles: ['hombros', 'biceps', 'triceps'],
        exercises: clean([
          ex('ho1',  3, 10),  // Press hombro
          ex('ho3',  3, 12),  // Laterales
          ex('ho4',  3, 12),  // Frontal
          ex('ho5',  3, 12),  // Flys posterior pec-deck
          ex('bi2',  3, 10),  // Curls mancuerna
          ex('bi6',  3, 10),  // Predicador
          ex('bi7',  3, 10),  // Curl inclinado
          ex('tr2',  3, 10),  // Extensión soga cable
          ex('tr11', 3, 10),  // Copa soga
          ex('tr1',  3, 10),  // Press francés
        ]),
      },
      {
        id: 'r2d3',
        label: 'Miércoles / Sábado — Pierna Completa',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi3',  3, 10),  // Extensión cuádriceps
          ex('pi1',  3, 10),  // Sentadilla Smith
          ex('pi2',  3, 10),  // Prensa Sumo
          ex('pi11', 3, 10),  // Femoral sentado
          ex('pi4',  3, 10),  // Femoral acostado
          ex('es6',  3, 10),  // Peso muerto
          ex('pi8',  3, 10),  // Hip-thrust
          ex('pi12', 3, 12),  // Adductores
          ex('pi10', 3, 12),  // Pantorrilla
        ]),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  RUTINA 3 — PUSH PULL LEGS (Dady Aioly)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'preset_dady_ppl',
    name: 'Push Pull Legs — Dady Aioly',
    emoji: '🔄',
    description: 'Rutina PPL de 6 días. Empuje (pecho+hombro+tríceps) / Jalón (espalda+bíceps) / Pierna, dos veces por semana.',
    frequency: '6 días/semana',
    level: 'Intermedio-Avanzado',
    days: [
      {
        id: 'r3d1',
        label: 'Lunes — Empuje (Pecho, Hombro, Tríceps)',
        suggestedMuscles: ['pecho', 'hombros', 'triceps'],
        exercises: clean([
          ex('pe2',  3, 10),  // Press inclinado Smith
          ex('pe5',  3, 8),   // Press plano mancuerna
          ex('pe11', 3, 10),  // Flys pec-deck + lagartijas
          ex('ho10', 3, 10),  // Press hombro máquina
          ex('ho3',  3, 10),  // Laterales cable
          ex('ho4',  3, 10),  // Frontal barra
          ex('tr6',  3, 8),   // Extensión barra cable
          ex('tr11', 3, 10),  // Copa soga
          ex('pe6',  3, 10),  // Fondos (al fallo)
        ]),
      },
      {
        id: 'r3d2',
        label: 'Martes — Jalón (Espalda, Bíceps)',
        suggestedMuscles: ['espalda', 'biceps'],
        exercises: clean([
          ex('es3',  3, 10),  // Remo barra/Smith
          ex('es4',  3, 10),  // Remo mancuerna
          ex('es7',  3, 12),  // Remo máquina polea
          ex('es1',  3, 12),  // Dominadas
          ex('ho5',  3, 10),  // Flys posterior mancuerna
          ex('ho8',  3, 12),  // Posterior polea (face pull)
          ex('ho3',  3, 12),  // Laterales
          ex('bi2',  3, 8),   // Curls sentado (drop-set)
          ex('bi6',  3, 12),  // Predicador
          ex('bi3',  3, 10),  // Martillos
        ]),
      },
      {
        id: 'r3d3',
        label: 'Miércoles — Pierna (Cuádriceps)',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi1',  3, 10),  // Sentadilla Smith
          ex('pi14', 3, 10),  // Sentadilla Hack
          ex('pi3',  3, 10),  // Extensión pierna
          ex('pi2',  3, 10),  // Prensa
          ex('pi6',  3, 12),  // Desplantes
          ex('pi9',  3, 10),  // Abductores
          ex('pi10', 4, 15),  // Pantorrilla costurera
        ]),
      },
      {
        id: 'r3d4',
        label: 'Jueves — Empuje (Pecho, Hombro, Tríceps)',
        suggestedMuscles: ['pecho', 'hombros', 'triceps'],
        exercises: clean([
          ex('pe1',  3, 10),  // Press plano barra
          ex('pe5',  3, 10),  // Press inclinado mancuerna
          ex('pe11', 3, 10),  // Flys pec-deck
          ex('pe7',  3, 12),  // Cross-overs
          ex('ho2',  3, 8),   // Press hombro mancuerna
          ex('ho3',  3, 12),  // Laterales + frontal cable
          ex('tr1',  3, 8),   // Press francés
          ex('tr2',  3, 10),  // Extensión
          ex('tr11', 3, 10),  // Copa cables
        ]),
      },
      {
        id: 'r3d5',
        label: 'Viernes — Jalón (Espalda, Bíceps)',
        suggestedMuscles: ['espalda', 'biceps'],
        exercises: clean([
          ex('es2',  3, 10),  // Jalón al pecho
          ex('es11', 3, 10),  // Jalón triángulo
          ex('es12', 3, 10),  // Jalón agarre supino
          ex('es1',  3, 12),  // Dominadas
          ex('ho5',  3, 12),  // Flys posterior
          ex('ho7',  3, 12),  // Jalón cara (upright row)
          ex('bi1',  3, 10),  // Curl barra
          ex('bi7',  3, 12),  // Curl inclinado
          ex('bi4',  3, 10),  // Hércules polea
        ]),
      },
      {
        id: 'r3d6',
        label: 'Sábado — Pierna (Femoral y Glúteos)',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('es6',  3, 10),  // Peso muerto
          ex('pi4',  4, 10),  // Femoral acostado (drop-set)
          ex('pi11', 4, 10),  // Femoral sentado
          ex('pi8',  4, 10),  // Hip-thrust
          ex('pi9',  3, 10),  // Abductores
          ex('pi10', 4, 15),  // Pantorrilla Smith
        ]),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  //  RUTINA 4 — 3 DÍAS (Dady Aioly)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'preset_dady_3dias',
    name: 'Rutina 3 días — Dady Aioly',
    emoji: '📅',
    description: 'Rutina de 3 días semanales ideal para quienes tienen tiempo limitado. Pecho+Espalda / Hombros+Brazos / Pierna.',
    frequency: '3 días/semana',
    level: 'Principiante-Intermedio',
    days: [
      {
        id: 'r4d1',
        label: 'Lunes — Pecho y Espalda',
        suggestedMuscles: ['pecho', 'espalda'],
        exercises: clean([
          ex('pe2',  4, 12),  // Press inclinado Smith
          ex('pe1',  4, 10),  // Press plano barra
          ex('pe7',  4, 10),  // Cross-overs
          ex('pe11', 4, 10),  // Flys pec-deck
          ex('es2',  4, 10),  // Jalón al pecho
          ex('es3',  4, 10),  // Remo barra/Smith
          ex('es12', 4, 10),  // Jalón agarre supino
          ex('es7',  4, 12),  // Remo máquina polea
        ]),
      },
      {
        id: 'r4d2',
        label: 'Miércoles — Hombro, Bíceps y Tríceps',
        suggestedMuscles: ['hombros', 'biceps', 'triceps'],
        exercises: clean([
          ex('ho10', 4, 10),  // Press hombro máquina/Smith
          ex('ho3',  4, 10),  // Laterales
          ex('ho4',  4, 10),  // Frontal barra cable
          ex('ho5',  4, 12),  // Flys posterior pec-deck
          ex('tr1',  4, 8),   // Press francés
          ex('tr6',  4, 8),   // Extensión barra cable
          ex('tr11', 4, 10),  // Copa soga
          ex('bi2',  4, 8),   // Curls sentado (drop-set)
          ex('bi6',  4, 10),  // Predicador
          ex('bi7',  4, 10),  // Curl inclinado
        ]),
      },
      {
        id: 'r4d3',
        label: 'Viernes — Pierna Completa',
        suggestedMuscles: ['piernas'],
        exercises: clean([
          ex('pi3',  3, 12),  // Extensión cuádriceps
          ex('pi1',  3, 10),  // Sentadilla Smith
          ex('pi2',  3, 10),  // Prensa
          ex('es6',  3, 10),  // Peso muerto
          ex('pi11', 3, 10),  // Femoral sentado
          ex('pi4',  3, 10),  // Femoral acostado
          ex('pi8',  3, 10),  // Hip-thrust
          ex('pi9',  3, 10),  // Abductores
          ex('pi10', 3, 15),  // Pantorrilla costurera
        ]),
      },
    ],
  },
]
