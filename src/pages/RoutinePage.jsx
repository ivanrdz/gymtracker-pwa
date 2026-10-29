import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROUTINE_TYPES } from '../data/routines'
import { EXERCISES, MUSCLE_GROUPS } from '../data/exercises'
import { PRESET_ROUTINES } from '../data/presetRoutines'
import { Plus, Trash2, Play, ChevronDown, ChevronUp, BookOpen, Calendar } from 'lucide-react'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const WEEK_DAYS = [
  { key: 'lun', label: 'Lun', full: 'Lunes' },
  { key: 'mar', label: 'Mar', full: 'Martes' },
  { key: 'mie', label: 'Mié', full: 'Miércoles' },
  { key: 'jue', label: 'Jue', full: 'Jueves' },
  { key: 'vie', label: 'Vie', full: 'Viernes' },
  { key: 'sab', label: 'Sáb', full: 'Sábado' },
  { key: 'dom', label: 'Dom', full: 'Domingo' },
]

function StepChooseType({ onSelect, onFree }) {
  return (
    <div className="page">
      <h1 className="page-title">Nueva Rutina</h1>
      <p className="page-subtitle">Elige el tipo de rutina</p>

      {/* Rutina libre — destacada */}
      <button className="free-routine-banner" onClick={onFree}>
        <span className="free-routine-icon"><Calendar size={22}/></span>
        <div className="free-routine-text">
          <span className="free-routine-name">Rutina libre</span>
          <span className="free-routine-desc">Elige los días y grupo muscular tú mismo</span>
        </div>
        <span className="free-routine-arrow">→</span>
      </button>

      <p className="page-subtitle" style={{marginTop:20,marginBottom:8}}>O elige una estructura predefinida</p>
      <div className="routine-type-grid">
        {Object.values(ROUTINE_TYPES).map(rt => (
          <button key={rt.id} className="routine-type-card" onClick={() => onSelect(rt)}>
            <span className="rt-emoji">{rt.emoji}</span>
            <span className="rt-name">{rt.name}</span>
            <span className="rt-meta">{rt.frequency}</span>
            <span className="rt-level">{rt.level}</span>
            <p className="rt-desc">{rt.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepBuildFree({ onBack, onConfirm }) {
  const [selectedDays, setSelectedDays] = useState(new Set())
  // dayMuscles: { [dayKey]: string[] }  — multi-select
  const [dayMuscles, setDayMuscles] = useState({})

  const toggleDay = (key) => {
    setSelectedDays(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
        setDayMuscles(m => { const nm = { ...m }; delete nm[key]; return nm })
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleMuscle = (dayKey, muscle) => {
    setDayMuscles(prev => {
      const current = prev[dayKey] || []
      const exists = current.includes(muscle)
      return {
        ...prev,
        [dayKey]: exists ? current.filter(m => m !== muscle) : [...current, muscle]
      }
    })
  }

  const canConfirm = selectedDays.size > 0 && [...selectedDays].every(k => (dayMuscles[k] || []).length > 0)
  const orderedSelected = WEEK_DAYS.filter(d => selectedDays.has(d.key))

  const handleConfirm = () => {
    const days = orderedSelected.map(d => ({
      id: d.key,
      label: d.full,
      suggestedMuscles: dayMuscles[d.key] || [],
      exercises: []
    }))
    onConfirm(days)
  }

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{marginBottom:12}}>← Volver</button>
      <h1 className="page-title">🗓️ Rutina libre</h1>
      <p className="page-subtitle">Marca los días que entrenas</p>

      <div className="free-days-grid">
        {WEEK_DAYS.map(d => (
          <button
            key={d.key}
            className={`free-day-btn ${selectedDays.has(d.key) ? 'active' : ''}`}
            onClick={() => toggleDay(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {orderedSelected.length > 0 && (
        <>
          <p className="page-subtitle" style={{marginTop:20,marginBottom:8}}>
            Elige los grupos musculares de cada día <span style={{opacity:0.6}}>(puedes elegir varios)</span>
          </p>
          {orderedSelected.map(d => {
            const selected = dayMuscles[d.key] || []
            return (
              <div key={d.key} className="card free-day-config">
                <div className="free-day-header">
                  <span className="free-day-name">{d.full}</span>
                  <span className="free-day-count">
                    {selected.length === 0 ? 'Sin músculo' : `${selected.length} grupo${selected.length > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="free-muscle-chips">
                  {Object.entries(MUSCLE_GROUPS).map(([key, mg]) => {
                    const isActive = selected.includes(key)
                    return (
                      <button
                        key={key}
                        className={`free-muscle-chip ${isActive ? 'active' : ''}`}
                        style={{
                          borderColor: isActive ? mg.color : 'var(--border)',
                          background: isActive ? mg.color + '22' : 'transparent',
                          color: isActive ? mg.color : 'var(--text-secondary)',
                        }}
                        onClick={() => toggleMuscle(d.key, key)}
                      >
                        {isActive && <span style={{marginRight:3}}>✓</span>}
                        {mg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}

      {selectedDays.size === 0 && (
        <p className="hint" style={{marginTop:12}}>Selecciona al menos un día para continuar.</p>
      )}
      {selectedDays.size > 0 && !canConfirm && (
        <p className="hint" style={{marginTop:12}}>Asigna al menos un grupo muscular a cada día seleccionado.</p>
      )}

      <button
        className="btn btn-primary btn-full"
        disabled={!canConfirm}
        onClick={handleConfirm}
        style={{marginTop: 20}}
      >
        <Play size={16}/> Continuar → Agregar ejercicios
      </button>
    </div>
  )
}

function StepConfigure({ routineType, initialDays, initialName, onBack, onStart, customExercises }) {
  const [name, setName] = useState(initialName || `Mi rutina ${routineType?.name || ''}`)
  const [weeks, setWeeks] = useState(4)
  const [days, setDays] = useState(
    initialDays
      ? initialDays
      : routineType.days.map(d => ({ ...d, exercises: [] }))
  )
  const [expandedDay, setExpandedDay] = useState(0)
  const [showCatalog, setShowCatalog] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('all')
  const [targetDayIdx, setTargetDayIdx] = useState(null)

  const allExercises = [...EXERCISES, ...customExercises]

  const openCatalog = (i) => {
    setTargetDayIdx(i)
    setCatalogFilter(days[i].suggestedMuscles?.[0] || 'all')
    setShowCatalog(true)
  }

  const addExercise = (ex) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== targetDayIdx) return d
      if (d.exercises.find(e => e.id === ex.id)) return d
      return { ...d, exercises: [...d.exercises, { ...ex, sets: 3, reps: 10 }] }
    }))
    setShowCatalog(false)
  }

  const removeExercise = (di, exId) =>
    setDays(prev => prev.map((d, i) => i === di ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d))

  const updateEx = (di, exId, field, val) =>
    setDays(prev => prev.map((d, i) => i === di
      ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e) }
      : d))

  const dayMuscles = days[targetDayIdx]?.suggestedMuscles || Object.keys(MUSCLE_GROUPS)
  const filteredEx = (catalogFilter === 'all' ? allExercises.filter(e => dayMuscles.includes(e.muscle)) : allExercises.filter(e => e.muscle === catalogFilter))
  const canStart = days.every(d => d.exercises.length > 0) && name.trim()
  const suggestedMusclesForModal = days[targetDayIdx]?.suggestedMuscles || Object.keys(MUSCLE_GROUPS)

  const handleStart = () => {
    onStart({ id: genId(), name, routineType: routineType?.id || 'custom', durationWeeks: weeks, status: 'draft', days, startWeight: '', endWeight: '', photoStart: null, photoEnd: null })
  }

  return (
    <div className="page">
      {showCatalog && (
        <div className="modal-overlay" onClick={() => setShowCatalog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Elige un ejercicio</h3>
            <div className="muscle-filter">
              <button className={`chip ${catalogFilter==='all'?'active':''}`} onClick={() => setCatalogFilter('all')}>Todos</button>
              {suggestedMusclesForModal.map(m => (
                <button key={m} className={`chip ${catalogFilter===m?'active':''}`} onClick={() => setCatalogFilter(m)}>
                  {MUSCLE_GROUPS[m]?.label}
                </button>
              ))}
            </div>
            <div className="catalog-list">
              {filteredEx.map(ex => (
                <button key={ex.id} className="catalog-item" onClick={() => addExercise(ex)}>
                  <div className="catalog-item-img-wrap">
                    {ex.image
                      ? <img src={ex.image} alt={ex.name} className="catalog-item-img"
                          onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }} />
                      : null}
                    <div className="catalog-item-img-fallback"
                      style={{display: ex.image ? 'none' : 'flex', background: (MUSCLE_GROUPS[ex.muscle]?.color || '#888') + '33'}}>
                      <span style={{color: MUSCLE_GROUPS[ex.muscle]?.color || '#888'}}>{MUSCLE_GROUPS[ex.muscle]?.label?.slice(0,2).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="catalog-item-text">
                    <span className="catalog-item-name">{ex.name}{ex.custom ? ' ★' : ''}</span>
                    <span className="catalog-item-muscle" style={{ color: MUSCLE_GROUPS[ex.muscle]?.color }}>{MUSCLE_GROUPS[ex.muscle]?.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-full" onClick={() => setShowCatalog(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{marginBottom:12}}>← Volver</button>
      <h1 className="page-title">{routineType?.emoji || '🏋️'} {name}</h1>

      <div className="card">
        <label className="form-label">Nombre de la rutina</label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        <label className="form-label" style={{marginTop:16}}>Duración (semanas)</label>
        <div className="weeks-selector">
          {[2,3,4,5,6].map(w => (
            <button key={w} className={`week-btn ${weeks===w?'active':''}`} onClick={() => setWeeks(w)}>{w}</button>
          ))}
        </div>
      </div>

      <h3 className="section-title">Ejercicios por día</h3>
      {days.map((day, di) => (
        <div key={day.id} className="card day-card">
          <button className="day-header" onClick={() => setExpandedDay(expandedDay===di?-1:di)}>
            <span className="day-label">{day.label}</span>
            <span className="day-meta">{day.exercises.length} ejercicios</span>
            {expandedDay===di ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          {expandedDay===di && (
            <div className="day-body">
              {day.suggestedMuscles?.length > 0 && (
                <div className="suggested-muscles">
                  {day.suggestedMuscles.map(m => (
                    <span key={m} className="muscle-chip"
                      style={{borderColor:MUSCLE_GROUPS[m]?.color,color:MUSCLE_GROUPS[m]?.color,background:MUSCLE_GROUPS[m]?.color+'22'}}>
                      {MUSCLE_GROUPS[m]?.label}
                    </span>
                  ))}
                </div>
              )}
              {day.exercises.map(ex => (
                <div key={ex.id} className="exercise-row">
                  <div className="exercise-info">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-muscle" style={{color:MUSCLE_GROUPS[ex.muscle]?.color}}>{MUSCLE_GROUPS[ex.muscle]?.label}</span>
                  </div>
                  <div className="exercise-controls">
                    <div className="mini-field">
                      <label>Series</label>
                      <input type="number" min="1" max="10" value={ex.sets} onChange={e => updateEx(di,ex.id,'sets',+e.target.value)}/>
                    </div>
                    <div className="mini-field">
                      <label>Reps</label>
                      <input type="number" min="1" max="50" value={ex.reps} onChange={e => updateEx(di,ex.id,'reps',+e.target.value)}/>
                    </div>
                    <button className="icon-btn danger" onClick={() => removeExercise(di,ex.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={() => openCatalog(di)}>
                <Plus size={14}/> Agregar ejercicio
              </button>
            </div>
          )}
        </div>
      ))}

      {!canStart && <p className="hint">Agrega al menos 1 ejercicio en cada día para continuar.</p>}
      <button className="btn btn-primary btn-full" disabled={!canStart} onClick={handleStart}>
        <Play size={16}/> Guardar e Iniciar Rutina
      </button>
    </div>
  )
}

function PresetCard({ preset, onUse }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card preset-card">
      <div className="preset-header">
        <span className="preset-emoji">{preset.emoji}</span>
        <div className="preset-info">
          <h4 className="preset-name">{preset.name}</h4>
          <div className="preset-meta-row">
            <span className="preset-chip">{preset.frequency}</span>
            <span className="preset-chip">{preset.level}</span>
          </div>
          <p className="preset-desc">{preset.description}</p>
        </div>
      </div>
      <button className="preset-toggle" onClick={() => setExpanded(v => !v)}>
        {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        {expanded ? 'Ocultar días' : `Ver ${preset.days.length} días`}
      </button>
      {expanded && (
        <div className="preset-days">
          {preset.days.map(d => (
            <div key={d.id} className="preset-day">
              <span className="preset-day-label">{d.label}</span>
              <span className="preset-day-count">{d.exercises.length} ejercicios</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-primary btn-full" style={{marginTop:12}} onClick={() => onUse(preset)}>
        <BookOpen size={14}/> Usar esta rutina
      </button>
    </div>
  )
}

export default function RoutinePage() {
  const { saveRoutine, startRoutine, deleteRoutine, getActiveRoutines, routines, customExercises } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState('list')
  const [selectedType, setSelectedType] = useState(null)
  const [presetData, setPresetData] = useState(null)
  const [freeDays, setFreeDays] = useState(null)
  const activeRoutines = getActiveRoutines()

  const handleStart = (routine) => {
    saveRoutine(routine)
    startRoutine(routine.id)
    navigate('/')
  }

  const handleUsePreset = (preset) => {
    setPresetData(preset)
    setStep('configure-preset')
  }

  const handleFreeDaysConfirm = (days) => {
    setFreeDays(days)
    setSelectedType({ id: 'free', emoji: '🗓️', name: 'Rutina libre' })
    setStep('configure-free')
  }

  if (step === 'choose') return (
    <StepChooseType
      onSelect={t => { setSelectedType(t); setStep('configure') }}
      onFree={() => setStep('build-free')}
    />
  )
  if (step === 'build-free') return (
    <StepBuildFree
      onBack={() => setStep('choose')}
      onConfirm={handleFreeDaysConfirm}
    />
  )
  if (step === 'configure') return (
    <StepConfigure
      routineType={selectedType}
      onBack={() => setStep('choose')}
      onStart={handleStart}
      customExercises={customExercises}
    />
  )
  if (step === 'configure-free') return (
    <StepConfigure
      routineType={selectedType}
      initialDays={freeDays}
      initialName="Mi rutina libre"
      onBack={() => setStep('build-free')}
      onStart={handleStart}
      customExercises={customExercises}
    />
  )
  if (step === 'configure-preset') return (
    <StepConfigure
      routineType={{ id: 'custom', emoji: presetData.emoji, name: presetData.name }}
      initialDays={presetData.days}
      initialName={presetData.name}
      onBack={() => setStep('list')}
      onStart={handleStart}
      customExercises={customExercises}
    />
  )

  return (
    <div className="page">
      <h1 className="page-title">Rutinas</h1>

      {/* Rutinas activas — siempre visible */}
      {activeRoutines.length > 0 && (
        <>
          <h3 className="section-title">Activas ({activeRoutines.length})</h3>
          {activeRoutines.map(r => (
            <div key={r.id} className="card active-routine-card">
              <div className="active-badge">● ACTIVA</div>
              <h3>{r.name}</h3>
              <p className="page-subtitle">{r.durationWeeks} semanas · {r.days?.length ?? 0} días/semana</p>
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => navigate('/sesion')}>▶ Ir a sesión</button>
                <button className="btn btn-danger-ghost" onClick={() => deleteRoutine(r.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Crear nueva — siempre disponible */}
      <button className="btn btn-primary btn-full" style={{marginTop: activeRoutines.length > 0 ? 8 : 0}} onClick={() => setStep('choose')}>
        <Plus size={16}/> Crear rutina personalizada
      </button>

      <h3 className="section-title" style={{marginTop:24}}>
        <BookOpen size={16} style={{verticalAlign:'middle', marginRight:6}}/>
        Rutinas de Dady Aioly
      </h3>
      <p className="page-subtitle" style={{marginBottom:12}}>
        Rutinas del fisiculturista mexicano. Úsalas como base o edítalas a tu gusto.
      </p>
      {PRESET_ROUTINES.map(preset => (
        <PresetCard key={preset.id} preset={preset} onUse={handleUsePreset} />
      ))}

      {routines.filter(r => r.status==='completed').length > 0 && (
        <>
          <h3 className="section-title">Completadas</h3>
          {routines.filter(r => r.status==='completed').map(r => (
            <div key={r.id} className="card">
              <h4>{r.name}</h4>
              <p className="page-subtitle">{r.durationWeeks} sem · {new Date(r.endDate).toLocaleDateString('es-MX')}</p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
