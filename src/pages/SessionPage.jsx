import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MUSCLE_GROUPS } from '../data/exercises'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Camera, X, Plus, Minus } from 'lucide-react'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const initSets = (ex) => Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: 0 }))

function histSummary(record) {
  const unit = record.unit || 'kg'
  if (!record) return null
  if (Array.isArray(record.sets)) {
    const total = record.sets.length
    const maxW = Math.max(...record.sets.map(s => s.weight || 0))
    const reps = record.sets.map(s => s.reps).join('-')
    return `${total} series · ${reps} reps · max ${maxW} ${unit}`
  }
  return `${record.sets}×${record.reps} · ${record.weight} ${unit}`
}

export default function SessionPage() {
  const { getActiveRoutines, getRoutineSessions, saveSession, weightUnit, getLastExerciseRecord, stopRoutine } = useApp()
  const navigate = useNavigate()
  const activeRoutines = getActiveRoutines()

  const [selectedRoutineId, setSelectedRoutineId] = useState(null)
  const [selectedDayId, setSelectedDayId]         = useState(null)
  const [checked, setChecked]                     = useState({})
  const [records, setRecords]                     = useState({})
  const [exerciseUnits, setExerciseUnits]         = useState({})
  const [expandedEx, setExpandedEx]               = useState(null)
  const [saved, setSaved]                         = useState(false)
  const [sessionPhoto, setSessionPhoto]           = useState(null)
  const [existingSessionId, setExistingSessionId] = useState(null)
  const photoRef = useRef(null)

  if (activeRoutines.length === 0) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <h2>Sin rutina activa</h2>
        <p>Activa una rutina para registrar sesiones.</p>
        <button className="btn btn-primary" onClick={() => navigate('/rutina')}>Ir a Rutinas</button>
      </div>
    </div>
  )

  // Determine current routine
  const routine = selectedRoutineId
    ? activeRoutines.find(r => r.id === selectedRoutineId) || activeRoutines[0]
    : activeRoutines[0]

  const sessions = getRoutineSessions(routine.id)
  const selectedDay = routine.days.find(d => d.id === selectedDayId)
  const total = selectedDay?.exercises.length || 0
  const done  = selectedDay ? selectedDay.exercises.filter(e => checked[e.id]).length : 0
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const getSets = (ex) => records[ex.id] || initSets(ex)
  const getExUnit = (exId) => exerciseUnits[exId] || weightUnit
  const toggleExUnit = (exId) => setExerciseUnits(p => ({
    ...p, [exId]: getExUnit(exId) === 'kg' ? 'lbs' : 'kg'
  }))

  const updateSet = (ex, idx, field, val) =>
    setRecords(p => ({
      ...p,
      [ex.id]: getSets(ex).map((s, i) => i === idx ? { ...s, [field]: val } : s)
    }))

  const addSet = (ex) => {
    const cur = getSets(ex)
    const last = cur[cur.length - 1] || { reps: ex.reps, weight: 0 }
    setRecords(p => ({ ...p, [ex.id]: [...cur, { ...last }] }))
  }

  const removeSet = (ex) => {
    const cur = getSets(ex)
    if (cur.length <= 1) return
    setRecords(p => ({ ...p, [ex.id]: cur.slice(0, -1) }))
  }

  const selectRoutine = (id) => {
    setSelectedRoutineId(id)
    setSelectedDayId(null); setChecked({}); setRecords({})
    setExpandedEx(null); setSessionPhoto(null); setExerciseUnits({})
    setExistingSessionId(null)
  }

  const selectDay = (id) => {
    setSelectedDayId(id)
    setExpandedEx(null); setExerciseUnits({})

    // Check if there's already a session saved today for this day
    const todayStr = new Date().toDateString()
    const todaySession = sessions.find(
      s => s.dayId === id && new Date(s.date).toDateString() === todayStr
    )

    if (todaySession) {
      // Pre-load existing session data
      const preRecords = {}
      const preChecked = {}
      const preUnits = {}
      todaySession.records?.forEach(r => {
        preRecords[r.exerciseId] = r.sets
        preChecked[r.exerciseId] = true
        if (r.unit) preUnits[r.exerciseId] = r.unit
      })
      setRecords(preRecords)
      setChecked(preChecked)
      setExerciseUnits(preUnits)
      setSessionPhoto(todaySession.photo || null)
      setExistingSessionId(todaySession.id)
    } else {
      setChecked({}); setRecords({})
      setSessionPhoto(null); setExistingSessionId(null)
    }
  }

  const toggleCheck = (id) => setChecked(p => ({ ...p, [id]: !p[id] }))

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setSessionPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!selectedDay || done === 0) return
    saveSession({
      id: existingSessionId || genId(),
      routineId: routine.id, dayId: selectedDayId,
      date: new Date().toISOString(), completed: pct > 0, completionPct: pct,
      photo: sessionPhoto,
      records: selectedDay.exercises.filter(e => checked[e.id]).map(ex => ({
        exerciseId: ex.id,
        unit: getExUnit(ex.id),
        sets: getSets(ex),
      })),
    })
    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/') }, 1800)
  }

  if (saved) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">✅</span>
        <h2>¡Sesión guardada!</h2>
        <p>Cumplimiento del día: <strong>{pct}%</strong></p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="session-page-header">
        <div>
          <h1 className="page-title">Sesión de hoy</h1>
          <p className="page-subtitle">{routine.name}</p>
        </div>
      </div>

      {/* Selector de rutina (solo si hay más de 1 activa) */}
      {activeRoutines.length > 1 && (
        <div className="routine-selector">
          {activeRoutines.map(r => (
            <div key={r.id} className={`routine-pill-wrap ${r.id === routine.id ? 'active' : ''}`}>
              <button
                className="routine-pill-name"
                onClick={() => selectRoutine(r.id)}
              >
                {r.name}
              </button>
              <button
                className="routine-pill-remove"
                title="Quitar rutina activa"
                onClick={() => {
                  stopRoutine(r.id)
                  if (r.id === routine.id) setSelectedRoutineId(null)
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="day-selector">
        {routine.days.map(day => {
          const hasSessions = sessions.some(s => s.dayId === day.id)
          return (
            <button key={day.id}
              className={`day-pill ${selectedDayId === day.id ? 'active' : ''}`}
              onClick={() => selectDay(day.id)}>
              <span>{day.label.split(' ')[0]}</span>
              {hasSessions && <span className="pill-done">✓</span>}
            </button>
          )
        })}
      </div>

      {!selectedDay && <div className="hint-box">Selecciona el día de tu rutina que vas a entrenar hoy.</div>}
      {selectedDay && existingSessionId && (
        <div className="hint-box hint-box-update">
          ✏️ Ya registraste este día hoy — puedes editar y actualizar
        </div>
      )}

      {selectedDay && (
        <>
          {/* Progreso */}
          <div className="card">
            <div className="progress-header">
              <span className="progress-label">{selectedDay.label}</span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="progress-sub">{done} / {total} ejercicios completados</p>
          </div>

          {/* Foto del día */}
          <div className="card">
            <div className="card-title"><Camera size={16} /> Foto de la sesión</div>
            {sessionPhoto ? (
              <div style={{ position: 'relative' }}>
                <img src={sessionPhoto} alt="Foto sesión"
                  style={{ width: '100%', borderRadius: 8, maxHeight: 280, objectFit: 'cover' }} />
                <button onClick={() => setSessionPhoto(null)}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button className="photo-upload-btn" onClick={() => photoRef.current?.click()}>
                <Camera size={24} /><span>Tomar o elegir foto</span>
              </button>
            )}
            <input ref={photoRef} type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          {/* Ejercicios */}
          {selectedDay.exercises.map(ex => {
            const isDone   = !!checked[ex.id]
            const isOpen   = expandedEx === ex.id
            const sets     = getSets(ex)
            const exUnit   = getExUnit(ex.id)
            const lastEntry = getLastExerciseRecord(ex.id)
            const histText  = lastEntry ? histSummary(lastEntry.record) : null
            const lastDate  = lastEntry
              ? new Date(lastEntry.session.date).toLocaleDateString('es-MX', { day:'numeric', month:'short' })
              : null

            return (
              <div key={ex.id} className={`card exercise-card ${isDone ? 'done' : ''}`}>
                <div className="exercise-card-header">
                  <button className="check-btn" onClick={() => toggleCheck(ex.id)}>
                    {isDone
                      ? <CheckCircle2 size={22} className="check-icon done" />
                      : <Circle size={22} className="check-icon" />}
                  </button>
                  <div className="exercise-card-info">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-muscle"
                      style={{ color: MUSCLE_GROUPS[ex.muscle]?.color }}>
                      {MUSCLE_GROUPS[ex.muscle]?.label}
                    </span>
                    {histText && (
                      <span className="exercise-history-hint">
                        📅 {lastDate}: {histText}
                      </span>
                    )}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span className="exercise-target">{sets.length}×{ex.reps}</span>
                    {/* Toggle KG/LBS por ejercicio */}
                    <button
                      className="unit-toggle-ex"
                      onClick={e => { e.stopPropagation(); toggleExUnit(ex.id) }}
                    >
                      {exUnit.toUpperCase()}
                    </button>
                  </div>
                  <button className="icon-btn" onClick={() => setExpandedEx(isOpen ? null : ex.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="exercise-card-body">
                    {ex.image && (
                      <div className="ex-img-wrap">
                        <img
                          src={ex.image}
                          alt={ex.name}
                          className="ex-img"
                          onError={e => { e.currentTarget.closest('.ex-img-wrap').style.display = 'none' }}
                        />
                        <div className="ex-img-label">{ex.name}</div>
                      </div>
                    )}

                    {lastEntry && Array.isArray(lastEntry.record.sets) && (
                      <div className="ex-history-detail">
                        <span className="ex-history-title">📋 Última vez ({lastDate})</span>
                        <div className="ex-history-rows">
                          {lastEntry.record.sets.map((s, i) => (
                            <span key={i} className="ex-history-row">
                              S{i+1}: {s.reps} reps · {s.weight} {lastEntry.record.unit || 'kg'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="sets-table">
                      <div className="sets-header">
                        <span className="set-col-label">Serie</span>
                        <span className="set-col-label">Reps</span>
                        <span className="set-col-label">Peso ({exUnit})</span>
                      </div>
                      {sets.map((s, idx) => (
                        <div key={idx} className="set-row">
                          <span className="set-num">{idx + 1}</span>
                          <input
                            className="set-input"
                            type="number" min="1" max="100"
                            value={s.reps}
                            onChange={e => updateSet(ex, idx, 'reps', +e.target.value)}
                          />
                          <input
                            className="set-input"
                            type="number" min="0" step="0.5"
                            value={s.weight}
                            onChange={e => updateSet(ex, idx, 'weight', +e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="set-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => addSet(ex)}>
                        <Plus size={13} /> Serie
                      </button>
                      {sets.length > 1 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeSet(ex)}>
                          <Minus size={13} /> Quitar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button className="btn btn-primary btn-full" onClick={handleSave} disabled={done === 0}>
            {existingSessionId ? `✏️ Actualizar sesión (${pct}%)` : `💾 Guardar sesión (${pct}%)`}
          </button>
        </>
      )}
    </div>
  )
}
