import { useApp } from '../context/AppContext'
import { EXERCISES } from '../data/exercises'
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react'

function recordSummary(r) {
  if (Array.isArray(r.sets) && r.sets.length > 0) {
    const maxW = Math.max(...r.sets.map(s => s.weight || 0))
    const unit = r.unit || 'kg'
    return `${r.sets.length} series · max ${maxW}${unit}`
  }
  if (r.weight != null) return `${r.weight}kg ${r.sets}×${r.reps}`
  return '—'
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString('es-MX')
}

export default function HistoryPage() {
  const { routines, getRoutineSessions, customExercises } = useApp()
  const allExercises = [...EXERCISES, ...(customExercises || [])]

  if (!routines.length) return (
    <div className="page center-page">
      <div className="empty-state">
        <span className="empty-icon">📜</span>
        <h2>Sin historial</h2>
        <p>Tu historial de rutinas aparecerá aquí.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <h1 className="page-title">Historial</h1>
      {routines.map(routine => {
        const sessions  = getRoutineSessions(routine.id)
        const days      = routine.days || []
        const totalDays = (routine.durationWeeks || 0) * days.length
        const full      = sessions.filter(s => s.completionPct === 100).length
        const partial   = sessions.filter(s => s.completionPct > 0 && s.completionPct < 100).length
        const missed    = Math.max(0, totalDays - full - partial)
        const overallPct = totalDays > 0
          ? Math.round(sessions.reduce((a, s) => a + (s.completionPct || 0), 0) / totalDays)
          : 0

        const statusLabel =
          routine.status === 'completed' ? 'Completada' :
          routine.status === 'active'    ? 'Activa'     :
          routine.status === 'idle'      ? 'Pausada'    : 'Borrador'

        return (
          <div key={routine.id} className="card history-card">
            <div className="history-header">
              <div>
                <h3>{routine.name}</h3>
                <p className="page-subtitle">
                  {routine.durationWeeks ? `${routine.durationWeeks} sem · ` : ''}
                  {fmtDate(routine.startDate)}
                  {routine.endDate ? ` → ${fmtDate(routine.endDate)}` : routine.startDate ? ' (en curso)' : ''}
                </p>
              </div>
              <span className={`status-badge ${routine.status || 'draft'}`}>
                {statusLabel}
              </span>
            </div>

            <div className="history-stats">
              <span className="hstat green"><CheckCircle2 size={13} /> {full} completos</span>
              <span className="hstat yellow"><MinusCircle size={13} /> {partial} parciales</span>
              <span className="hstat red"><XCircle size={13} /> {missed} faltados</span>
              <span className="hstat"><strong>{overallPct}%</strong> general</span>
            </div>

            {sessions.length > 0 && (
              <div className="history-sessions">
                {sessions.slice(-5).map(s => {
                  const day = days.find(d => d.id === s.dayId)
                  return (
                    <div key={s.id} className="session-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="session-date">
                          {new Date(s.date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="session-day">{day?.label}</span>
                        <span className={`session-pct ${s.completionPct === 100 ? 'green' : s.completionPct > 0 ? 'yellow' : 'red'}`}>
                          {s.completionPct}%
                        </span>
                      </div>
                      <div className="session-exercises">
                        {s.records?.map(r => {
                          const ex = allExercises.find(e => e.id === r.exerciseId)
                          return ex ? (
                            <span key={r.exerciseId} className="session-ex-chip" title={recordSummary(r)}>
                              {ex.name.split(' ').slice(0, 2).join(' ')} · {recordSummary(r)}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
