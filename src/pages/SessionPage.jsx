import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MUSCLE_GROUPS } from '../data/exercises'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Camera, X } from 'lucide-react'

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export default function SessionPage() {
  const { getActiveRoutine, getRoutineSessions, saveSession } = useApp()
  const navigate = useNavigate()
  const routine = getActiveRoutine()
  const sessions = routine ? getRoutineSessions(routine.id) : []

  const [selectedDayId, setSelectedDayId] = useState(null)
  const [checked, setChecked] = useState({})
  const [records, setRecords] = useState({})
  const [expandedEx, setExpandedEx] = useState(null)
  const [saved, setSaved] = useState(false)
  const [sessionPhoto, setSessionPhoto] = useState(null)
  const photoRef = useRef(null)

  if (!routine) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">📋</span>
        <h2>Sin rutina activa</h2>
        <p>Activa una rutina para registrar sesiones.</p>
        <button className="btn btn-primary" onClick={() => navigate('/rutina')}>Ir a Rutinas</button>
      </div>
    </div>
  )

  const selectedDay = routine.days.find(d => d.id === selectedDayId)
  const total = selectedDay?.exercises.length || 0
  const done = selectedDay ? selectedDay.exercises.filter(e => checked[e.id]).length : 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const selectDay = (id) => { setSelectedDayId(id); setChecked({}); setRecords({}); setExpandedEx(null); setSessionPhoto(null) }
  const toggleCheck = (id) => setChecked(p => ({ ...p, [id]: !p[id] }))
  const updateRec = (id, field, val) => setRecords(p => ({ ...p, [id]: { ...p[id], [field]: val } }))

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
      id: genId(), routineId: routine.id, dayId: selectedDayId,
      date: new Date().toISOString(), completed: pct > 0, completionPct: pct,
      photo: sessionPhoto,
      records: selectedDay.exercises.filter(e => checked[e.id]).map(e => ({
        exerciseId: e.id,
        sets: records[e.id]?.sets ?? e.sets,
        reps: records[e.id]?.reps ?? e.reps,
        weight: records[e.id]?.weight ?? 0,
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
      <h1 className="page-title">Sesión de hoy</h1>
      <p className="page-subtitle">{routine.name}</p>

      <div className="day-selector">
        {routine.days.map(day => {
          const hasSessions = sessions.some(s => s.dayId === day.id)
          return (
            <button key={day.id} className={`day-pill ${selectedDayId===day.id?'active':''}`} onClick={() => selectDay(day.id)}>
              <span>{day.label.split(' ')[0]}</span>
              {hasSessions && <span className="pill-done">✓</span>}
            </button>
          )
        })}
      </div>

      {!selectedDay && <div className="hint-box">Selecciona el día de tu rutina que vas a entrenar hoy.</div>}

      {selectedDay && (
        <>
          <div className="card">
            <div className="progress-header">
              <span className="progress-label">{selectedDay.label}</span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{width:`${pct}%`}}/>
            </div>
            <p className="progress-sub">{done} / {total} ejercicios completados</p>
          </div>

          {/* Foto del día */}
          <div className="card">
            <div className="card-title"><Camera size={16}/> Foto de la sesión</div>
            {sessionPhoto ? (
              <div style={{position:'relative'}}>
                <img src={sessionPhoto} alt="Foto sesión" style={{width:'100%',borderRadius:8,maxHeight:280,objectFit:'cover'}}/>
                <button onClick={()=>setSessionPhoto(null)} style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.6)',border:'none',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
                  <X size={14}/>
                </button>
              </div>
            ) : (
              <button className="photo-upload-btn" onClick={()=>photoRef.current?.click()}>
                <Camera size={24}/>
                <span>Tomar o elegir foto</span>
              </button>
            )}
            <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={handlePhoto}/>
          </div>

          {selectedDay.exercises.map(ex => {
            const isDone = !!checked[ex.id]
            const isOpen = expandedEx === ex.id
            const rec = records[ex.id] || {}
            return (
              <div key={ex.id} className={`card exercise-card ${isDone?'done':''}`}>
                <div className="exercise-card-header">
                  <button className="check-btn" onClick={() => toggleCheck(ex.id)}>
                    {isDone
                      ? <CheckCircle2 size={22} className="check-icon done"/>
                      : <Circle size={22} className="check-icon"/>}
                  </button>
                  <div className="exercise-card-info">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-muscle" style={{color:MUSCLE_GROUPS[ex.muscle]?.color}}>{MUSCLE_GROUPS[ex.muscle]?.label}</span>
                  </div>
                  <span className="exercise-target">{ex.sets}×{ex.reps}</span>
                  <button className="icon-btn" onClick={() => setExpandedEx(isOpen?null:ex.id)}>
                    {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                </div>
                {isOpen && (
                  <div className="exercise-card-body">
                    <div className="record-fields">
                      <div className="mini-field">
                        <label>Series</label>
                        <input type="number" min="1" max="20" value={rec.sets??ex.sets} onChange={e => updateRec(ex.id,'sets',+e.target.value)}/>
                      </div>
                      <div className="mini-field">
                        <label>Reps</label>
                        <input type="number" min="1" max="100" value={rec.reps??ex.reps} onChange={e => updateRec(ex.id,'reps',+e.target.value)}/>
                      </div>
                      <div className="mini-field">
                        <label>Peso (kg)</label>
                        <input type="number" min="0" step="0.5" value={rec.weight??0} onChange={e => updateRec(ex.id,'weight',+e.target.value)}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button className="btn btn-primary btn-full" onClick={handleSave} disabled={done===0}>
            💾 Guardar sesión ({pct}%)
          </button>
        </>
      )}
    </div>
  )
}
