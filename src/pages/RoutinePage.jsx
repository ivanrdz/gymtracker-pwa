import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROUTINE_TYPES } from '../data/routines'
import { EXERCISES, MUSCLE_GROUPS } from '../data/exercises'
import { Plus, Trash2, Play, ChevronDown, ChevronUp } from 'lucide-react'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

function StepChooseType({ onSelect }) {
  return (
    <div className="page">
      <h1 className="page-title">Nueva Rutina</h1>
      <p className="page-subtitle">Elige el tipo de rutina</p>
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

function StepConfigure({ routineType, onBack, onStart, customExercises }) {
  const [name, setName] = useState(`Mi rutina ${routineType.name}`)
  const [weeks, setWeeks] = useState(4)
  const [days, setDays] = useState(routineType.days.map(d => ({ ...d, exercises: [] })))
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
    onStart({ id: genId(), name, routineType: routineType.id, durationWeeks: weeks, status: 'draft', days, startWeight: '', endWeight: '', photoStart: null, photoEnd: null })
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
      <h1 className="page-title">{routineType.emoji} {routineType.name}</h1>

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

export default function RoutinePage() {
  const { saveRoutine, startRoutine, getActiveRoutine, deleteRoutine, routines, customExercises } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState('list')
  const [selectedType, setSelectedType] = useState(null)
  const active = getActiveRoutine()

  const handleStart = (routine) => {
    saveRoutine(routine)
    startRoutine(routine.id)
    navigate('/')
  }

  if (step === 'choose') return <StepChooseType onSelect={t => { setSelectedType(t); setStep('configure') }}/>
  if (step === 'configure') return <StepConfigure routineType={selectedType} onBack={() => setStep('choose')} onStart={handleStart} customExercises={customExercises}/>

  return (
    <div className="page">
      <h1 className="page-title">Rutinas</h1>

      {active && (
        <div className="card active-routine-card">
          <div className="active-badge">● ACTIVA</div>
          <h3>{active.name}</h3>
          <p className="page-subtitle">{active.durationWeeks} semanas · {active.days.length} días/semana</p>
          <div className="action-row">
            <button className="btn btn-primary" onClick={() => navigate('/sesion')}>▶ Ir a sesión</button>
            <button className="btn btn-danger-ghost" onClick={() => deleteRoutine(active.id)}>Eliminar</button>
          </div>
        </div>
      )}

      {!active && (
        <button className="btn btn-primary btn-full" onClick={() => setStep('choose')}>
          <Plus size={16}/> Crear nueva rutina
        </button>
      )}

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
