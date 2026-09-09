import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Camera, Scale, CheckCircle2 } from 'lucide-react'

export default function ProgressPage() {
  const { getActiveRoutine, saveRoutine, completeRoutine } = useApp()
  const navigate = useNavigate()
  const routine = getActiveRoutine()
  const fileStartRef = useRef()
  const fileEndRef = useRef()
  const [finished, setFinished] = useState(false)

  if (!routine) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">📸</span>
        <h2>Sin rutina activa</h2>
        <p>Activa una rutina para registrar tu progreso físico.</p>
        <button className="btn btn-primary" onClick={() => navigate('/rutina')}>Ir a Rutinas</button>
      </div>
    </div>
  )

  if (finished) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">🏆</span>
        <h2>¡Rutina completada!</h2>
        <p>Excelente trabajo. Tu historial está guardado.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Ver Dashboard</button>
      </div>
    </div>
  )

  const handlePhoto = (field, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => saveRoutine({ ...routine, [field]: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleWeight = (field, val) => saveRoutine({ ...routine, [field]: val })

  const startDate = routine.startDate ? new Date(routine.startDate) : null
  const endDate = startDate ? new Date(startDate.getTime() + routine.durationWeeks * 7 * 86400000) : null
  const elapsed = startDate ? Math.max(0, Math.floor((new Date() - startDate) / 86400000)) : 0
  const progressPct = Math.min(100, Math.round((elapsed / (routine.durationWeeks * 7)) * 100))

  const diff = routine.startWeight && routine.endWeight
    ? (+routine.endWeight - +routine.startWeight).toFixed(1) : null

  return (
    <div className="page">
      <h1 className="page-title">Progreso Físico</h1>
      <p className="page-subtitle">{routine.name}</p>

      <div className="card">
        <div className="progress-header">
          <span className="progress-label">Tiempo transcurrido</span>
          <span className="progress-pct">{progressPct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{width:`${progressPct}%`}}/>
        </div>
        <div className="timeline-dates">
          <span>{startDate?.toLocaleDateString('es-MX')}</span>
          <span>{endDate?.toLocaleDateString('es-MX')}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title"><Scale size={16}/> Peso corporal</h3>
        <div className="weight-row">
          <div className="mini-field" style={{flex:1}}>
            <label>Peso inicial (kg)</label>
            <input type="number" step="0.1" value={routine.startWeight||''} placeholder="0.0"
              onChange={e => handleWeight('startWeight', e.target.value)}/>
          </div>
          <div className="weight-arrow">→</div>
          <div className="mini-field" style={{flex:1}}>
            <label>Peso final (kg)</label>
            <input type="number" step="0.1" value={routine.endWeight||''} placeholder="0.0"
              onChange={e => handleWeight('endWeight', e.target.value)}/>
          </div>
        </div>
        {diff !== null && (
          <p className="weight-diff" style={{color: +diff < 0 ? 'var(--success)' : 'var(--warning)'}}>
            {+diff > 0 ? '+' : ''}{diff} kg
          </p>
        )}
      </div>

      <div className="photos-grid">
        {[['photoStart','📸 Así empecé',fileStartRef],['photoEnd','🏁 Así terminé',fileEndRef]].map(([field,label,ref]) => (
          <div key={field} className="photo-card">
            <h4 className="photo-label">{label}</h4>
            {routine[field]
              ? <img src={routine[field]} alt={label} className="progress-photo"/>
              : <button className="photo-placeholder" onClick={() => ref.current.click()}>
                  <Camera size={28}/><span>Agregar foto</span>
                </button>
            }
            {routine[field] && (
              <button className="btn btn-ghost btn-sm" style={{marginTop:6}} onClick={() => ref.current.click()}>Cambiar</button>
            )}
            <input ref={ref} type="file" accept="image/*" capture="environment" hidden onChange={e => handlePhoto(field, e)}/>
          </div>
        ))}
      </div>

      {progressPct >= 80 && (
        <div className="card complete-card">
          <CheckCircle2 size={24} className="check-icon done"/>
          <p>¡Ya estás cerca del fin! Puedes marcar la rutina como completada.</p>
          <button className="btn btn-success btn-full" onClick={() => { completeRoutine(routine.id, routine.endWeight); setFinished(true) }}>
            🏆 Marcar como completada
          </button>
        </div>
      )}
    </div>
  )
}
