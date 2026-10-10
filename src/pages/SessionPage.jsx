import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MUSCLE_GROUPS } from '../data/exercises'
import ExerciseChart from '../components/ui/ExerciseChart'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Camera, X, Plus, Minus, Share2, Timer } from 'lucide-react'

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

// Generate share image on canvas
function buildShareCanvas(routine, selectedDay, checkedExercises, records, pct) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080; canvas.height = 1080
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, 1080, 1080)

  // Gradient bar top
  const gTop = ctx.createLinearGradient(0, 0, 1080, 0)
  gTop.addColorStop(0, '#6366f1'); gTop.addColorStop(0.5, '#a855f7'); gTop.addColorStop(1, '#ec4899')
  ctx.fillStyle = gTop; ctx.fillRect(0, 0, 1080, 8)

  // Logo / app name
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'; ctx.fillText('GymTracker Pro', 60, 90)

  // Date
  const dateStr = new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillStyle = '#a8a8a8'; ctx.fillText(dateStr, 60, 135)

  // Divider
  ctx.fillStyle = '#262626'; ctx.fillRect(60, 160, 960, 1)

  // Routine + day
  ctx.font = 'bold 48px system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'; ctx.fillText(routine.name, 60, 230)
  ctx.font = '32px system-ui, sans-serif'
  ctx.fillStyle = '#a8a8a8'; ctx.fillText(selectedDay.label, 60, 275)

  // Completion ring (big number)
  ctx.font = 'bold 160px system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right'; ctx.fillText(`${pct}%`, 1020, 320)
  ctx.font = '28px system-ui, sans-serif'
  ctx.fillStyle = '#a8a8a8'; ctx.fillText('completado', 1020, 355)
  ctx.textAlign = 'left'

  // Divider
  ctx.fillStyle = '#262626'; ctx.fillRect(60, 390, 960, 1)

  // Exercise list
  let y = 450
  checkedExercises.slice(0, 8).forEach(ex => {
    const sets = records[ex.id] || initSets(ex)
    const maxW = Math.max(...sets.map(s => s.weight || 0))
    const vol = sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
    // Exercise name
    ctx.font = 'bold 30px system-ui, sans-serif'
    ctx.fillStyle = '#ffffff'; ctx.fillText(ex.name, 60, y)
    // Stats
    ctx.font = '24px system-ui, sans-serif'
    ctx.fillStyle = '#a8a8a8'
    ctx.fillText(`${sets.length} series · max ${maxW} kg · vol ${vol} kg`, 60, y + 30)
    // Gradient accent dot
    const dot = ctx.createRadialGradient(1010, y - 8, 0, 1010, y - 8, 8)
    dot.addColorStop(0, '#a855f7'); dot.addColorStop(1, '#6366f1')
    ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(1010, y - 8, 7, 0, Math.PI * 2); ctx.fill()
    y += 78
  })

  // Bottom gradient bar
  const gBot = ctx.createLinearGradient(0, 0, 1080, 0)
  gBot.addColorStop(0, '#6366f1'); gBot.addColorStop(0.5, '#a855f7'); gBot.addColorStop(1, '#ec4899')
  ctx.fillStyle = gBot; ctx.fillRect(0, 1072, 1080, 8)

  return canvas
}

export default function SessionPage() {
  const { getActiveRoutines, getRoutineSessions, saveSession, weightUnit,
          getLastExerciseRecord, stopRoutine, getStreak, getExerciseHistory, getExercisePR } = useApp()
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
  // Timer
  const [timer, setTimer] = useState(null) // { remaining, total } or null
  const timerRef = useRef(null)
  // PRs detected after save
  const [newPRs, setNewPRs] = useState([])
  const photoRef = useRef(null)

  const streak = getStreak()

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startTimer = useCallback((secs) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer({ remaining: secs, total: secs })
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (!t || t.remaining <= 1) {
          clearInterval(timerRef.current)
          navigator.vibrate?.([300, 100, 300])
          return null
        }
        return { ...t, remaining: t.remaining - 1 }
      })
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(null)
  }, [])

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

  const routine = selectedRoutineId
    ? activeRoutines.find(r => r.id === selectedRoutineId) || activeRoutines[0]
    : activeRoutines[0]

  const sessions = getRoutineSessions(routine.id)
  const selectedDay = routine.days.find(d => d.id === selectedDayId)
  const total = selectedDay?.exercises.length || 0
  const done  = selectedDay ? selectedDay.exercises.filter(e => checked[e.id]).length : 0
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  // Total volume for checked exercises
  const totalVolume = useMemo(() => {
    if (!selectedDay) return 0
    return selectedDay.exercises
      .filter(e => checked[e.id])
      .reduce((sum, ex) => {
        const sets = records[ex.id] || initSets(ex)
        return sum + sets.reduce((s2, s) => s2 + (s.reps || 0) * (s.weight || 0), 0)
      }, 0)
  }, [selectedDay, checked, records])

  // Weekly calendar grid
  const weeklyGrid = useMemo(() => {
    if (!routine?.durationWeeks) return []
    return Array.from({ length: routine.durationWeeks }, (_, wi) => {
      const daySessions = {}
      routine.days.forEach(day => {
        const sorted = sessions
          .filter(s => s.dayId === day.id)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        daySessions[day.id] = sorted[wi] || null
      })
      return { weekNum: wi + 1, daySessions }
    })
  }, [routine, sessions])

  const currentWeekIdx = useMemo(() => {
    for (let i = 0; i < weeklyGrid.length; i++) {
      if (routine?.days.some(d => !weeklyGrid[i].daySessions[d.id])) return i
    }
    return Math.max(0, weeklyGrid.length - 1)
  }, [weeklyGrid, routine])

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

    const todayStr = new Date().toDateString()
    const todaySession = sessions.find(
      s => s.dayId === id && new Date(s.date).toDateString() === todayStr
    )

    if (todaySession) {
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

    // Detect PRs before saving
    const prs = []
    selectedDay.exercises.filter(e => checked[e.id]).forEach(ex => {
      const sets = getSets(ex)
      const maxWeight = Math.max(...sets.map(s => s.weight || 0))
      if (maxWeight <= 0) return
      const pr = getExercisePR(ex.id)
      const prevMax = pr ? pr.maxWeight : -1
      if (maxWeight > prevMax) prs.push({ name: ex.name, weight: maxWeight, unit: getExUnit(ex.id) })
    })

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

    if (prs.length) {
      setNewPRs(prs)
      setTimeout(() => setNewPRs([]), 4000)
    }

    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/') }, 1800)
  }

  const handleShare = () => {
    if (!selectedDay) return
    const checkedExercises = selectedDay.exercises.filter(e => checked[e.id])
    const canvas = buildShareCanvas(routine, selectedDay, checkedExercises, records, pct)
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `gymtracker-${new Date().toISOString().slice(0,10)}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  if (saved) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">✅</span>
        <h2>¡Sesión guardada!</h2>
        <p>Cumplimiento del día: <strong>{pct}%</strong></p>
        {newPRs.length > 0 && (
          <div className="pr-banner">
            🏆 ¡Nuevo PR! {newPRs.map(p => `${p.name} ${p.weight}${p.unit}`).join(' · ')}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="page">
      {/* PR Banner */}
      {newPRs.length > 0 && (
        <div className="pr-toast">
          🏆 ¡Nuevo PR! {newPRs.map(p => `${p.name} — ${p.weight} ${p.unit}`).join(' · ')}
        </div>
      )}

      {/* Timer float */}
      {timer && (
        <div className="timer-float">
          <div className="timer-ring">
            <svg viewBox="0 0 48 48" className="timer-svg">
              <circle cx="24" cy="24" r="20" stroke="var(--border)" strokeWidth="3" fill="none" />
              <circle cx="24" cy="24" r="20"
                stroke="url(#tg)" strokeWidth="3" fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - timer.remaining / timer.total)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset .9s linear' }}
              />
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <span className="timer-text">{timer.remaining}s</span>
          </div>
          <button className="timer-stop" onClick={stopTimer}><X size={12}/></button>
        </div>
      )}

      <div className="session-page-header">
        <div>
          <h1 className="page-title">Sesión de hoy</h1>
          <p className="page-subtitle">{routine.name}</p>
        </div>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-fire">🔥</span>
            <span className="streak-num">{streak}</span>
          </div>
        )}
      </div>

      {activeRoutines.length > 1 && (
        <div className="routine-selector">
          {activeRoutines.map(r => (
            <div key={r.id} className={`routine-pill-wrap ${r.id === routine.id ? 'active' : ''}`}>
              <button className="routine-pill-name" onClick={() => selectRoutine(r.id)}>{r.name}</button>
              <button className="routine-pill-remove" title="Quitar rutina activa"
                onClick={() => { stopRoutine(r.id); if (r.id === routine.id) setSelectedRoutineId(null) }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progreso semanal */}
      {weeklyGrid.length > 0 && (
        <div className="card weekly-grid-card">
          <div className="card-title">📅 Progreso semanal</div>
          <div className="weekly-grid">
            {weeklyGrid.map((week, wi) => (
              <div key={wi} className={`week-row ${wi === currentWeekIdx ? 'week-row--current' : ''}`}>
                <span className="week-row-lbl">S{week.weekNum}</span>
                <div className="week-cells">
                  {routine.days.map(day => {
                    const s = week.daySessions[day.id]
                    return (
                      <button key={day.id}
                        className={`week-cell ${s ? 'week-cell--done' : ''} ${selectedDayId === day.id && wi === currentWeekIdx ? 'week-cell--active' : ''}`}
                        onClick={() => selectDay(day.id)}
                        title={s ? `${day.label} · ${s.completionPct}%` : day.label}>
                        <span className="wc-lbl">{day.label.split(' ')[0].slice(0, 4)}</span>
                        {s && <span className="wc-pct">{s.completionPct}%</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
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
        <div className="hint-box hint-box-update">✏️ Ya registraste este día hoy — puedes editar y actualizar</div>
      )}

      {selectedDay && (
        <>
          {/* Progreso + Volumen */}
          <div className="card">
            <div className="progress-header">
              <span className="progress-label">{selectedDay.label}</span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-footer">
              <p className="progress-sub">{done} / {total} ejercicios</p>
              {totalVolume > 0 && (
                <p className="progress-vol">⚡ {totalVolume.toLocaleString()} kg vol</p>
              )}
            </div>
          </div>

          {/* Timer de descanso */}
          <div className="card timer-card">
            <div className="card-title"><Timer size={15}/> Descanso entre series</div>
            <div className="timer-btns">
              {[30, 60, 90, 120].map(s => (
                <button key={s} className="btn btn-ghost btn-sm timer-preset"
                  onClick={() => startTimer(s)}>{s}s</button>
              ))}
              {timer && (
                <button className="btn btn-ghost btn-sm" onClick={stopTimer} style={{color:'var(--danger)'}}>
                  <X size={12}/> Parar
                </button>
              )}
            </div>
          </div>

          {/* Foto */}
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
            const exHistory = getExerciseHistory(ex.id)
            const exPR = getExercisePR(ex.id)
            const currentMax = Math.max(...sets.map(s => s.weight || 0))
            const isNewPR = currentMax > 0 && exPR && currentMax > exPR.maxWeight

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
                    <span className="exercise-muscle" style={{ color: MUSCLE_GROUPS[ex.muscle]?.color }}>
                      {MUSCLE_GROUPS[ex.muscle]?.label}
                    </span>
                    {histText && (
                      <span className="exercise-history-hint">📅 {lastDate}: {histText}</span>
                    )}
                    {exPR && (
                      <span className="exercise-pr-hint">🏅 PR: {exPR.maxWeight} {exPR.unit}</span>
                    )}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span className="exercise-target">{sets.length}×{ex.reps}</span>
                    <button className="unit-toggle-ex" onClick={e => { e.stopPropagation(); toggleExUnit(ex.id) }}>
                      {exUnit.toUpperCase()}
                    </button>
                    {isNewPR && <span className="pr-star">🏆</span>}
                  </div>
                  <button className="icon-btn" onClick={() => setExpandedEx(isOpen ? null : ex.id)}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="exercise-card-body">
                    {ex.image && (
                      <div className="ex-img-wrap">
                        <img src={ex.image} alt={ex.name} className="ex-img"
                          onError={e => { e.currentTarget.closest('.ex-img-wrap').style.display = 'none' }} />
                        <div className="ex-img-label">{ex.name}</div>
                      </div>
                    )}

                    {/* Gráfica de progreso */}
                    <ExerciseChart history={exHistory} />

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
                        <span className="set-col-label">Rest</span>
                      </div>
                      {sets.map((s, idx) => (
                        <div key={idx} className="set-row">
                          <span className="set-num">{idx + 1}</span>
                          <input className="set-input" type="number" min="1" max="100"
                            value={s.reps}
                            onChange={e => updateSet(ex, idx, 'reps', +e.target.value)} />
                          <input className="set-input" type="number" min="0" step="0.5"
                            value={s.weight}
                            onChange={e => updateSet(ex, idx, 'weight', +e.target.value)} />
                          <button className="set-rest-btn" onClick={() => startTimer(90)}>
                            <Timer size={13}/>
                          </button>
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

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={done === 0}>
              {existingSessionId ? `✏️ Actualizar (${pct}%)` : `💾 Guardar (${pct}%)`}
            </button>
            {done > 0 && (
              <button className="btn btn-ghost" style={{ padding: '0 18px' }} onClick={handleShare} title="Compartir sesión">
                <Share2 size={18} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
