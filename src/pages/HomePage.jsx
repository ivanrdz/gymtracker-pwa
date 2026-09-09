import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApp } from '../context/AppContext'
import { EXERCISES } from '../data/exercises'
import BodyMap from '../components/ui/BodyMap'
import { Calendar, Zap, CheckCircle2 } from 'lucide-react'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899']

export default function HomePage() {
  const { getActiveRoutine, getRoutineSessions } = useApp()
  const navigate = useNavigate()
  const active = getActiveRoutine()
  const sessions = active ? getRoutineSessions(active.id) : []

  const chartData = useMemo(() => {
    if (!sessions.length) return []
    const byDate = {}
    sessions.filter(s => s.completed).forEach(s => {
      const day = new Date(s.date).toLocaleDateString('es-MX',{month:'short',day:'numeric'})
      if (!byDate[day]) byDate[day] = { day }
      s.records?.forEach(r => {
        const ex = EXERCISES.find(e => e.id === r.exerciseId)
        if (!ex) return
        const key = ex.name.split(' ').slice(0,2).join(' ')
        if (!byDate[day][key] || byDate[day][key] < r.weight) byDate[day][key] = r.weight
      })
    })
    return Object.values(byDate)
  }, [sessions])

  const todayStr = new Date().toDateString()
  const todaySession = sessions.find(s => new Date(s.date).toDateString() === todayStr)

  const todayMuscles = useMemo(() => {
    if (!todaySession || !active) return []
    return active.days?.find(d => d.id === todaySession.dayId)?.suggestedMuscles || []
  }, [todaySession, active])

  const weekMuscles = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
    const muscles = new Set()
    sessions.filter(s => new Date(s.date) >= weekStart && s.completed).forEach(s => {
      active?.days?.find(d => d.id === s.dayId)?.suggestedMuscles?.forEach(m => muscles.add(m))
    })
    return [...muscles]
  }, [sessions, active])

  const completionStats = useMemo(() => {
    if (!active) return []
    const start = new Date(active.startDate)
    const today = new Date()
    const days = []
    for (let w = 0; w < active.durationWeeks; w++) {
      active.days.forEach((day, di) => {
        const d = new Date(start)
        d.setDate(start.getDate() + w * 7 + di)
        const s = sessions.find(s => new Date(s.date).toDateString() === d.toDateString() && s.dayId === day.id)
        days.push({
          label: `S${w+1} ${day.label.split(' ')[0]}`,
          pct: s?.completionPct ?? (d < today ? 0 : null),
          status: s ? (s.completionPct===100?'full':s.completionPct>0?'partial':'missed') : (d<today?'missed':'future'),
        })
      })
    }
    return days
  }, [active, sessions])

  const exerciseKeys = chartData.length ? Object.keys(chartData[0]).filter(k => k!=='day') : []
  const doneCount = completionStats.filter(d=>d.status==='full').length
  const partialCount = completionStats.filter(d=>d.status==='partial').length
  const missedCount = completionStats.filter(d=>d.status==='missed').length
  const pastDays = completionStats.filter(d=>d.status!=='future')
  const overallPct = pastDays.length ? Math.round(pastDays.reduce((a,d)=>a+(d.pct??0),0)/pastDays.length) : 0

  if (!active) {
    return (
      <div className="page center-page">
        <div className="empty-state">
          <span className="empty-icon">💪</span>
          <h2>Sin rutina activa</h2>
          <p>Crea y activa una rutina para ver tu progreso aquí.</p>
          <button className="btn btn-primary" onClick={() => navigate('/rutina')}>Crear Rutina</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="page-title">{active.name}</h1>
          <p className="page-subtitle">{active.durationWeeks} sem · {active.routineType?.replace('_',' ')}</p>
        </div>
        <div className="stat-badge">{overallPct}%</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <CheckCircle2 size={18} className="stat-icon green"/>
          <span className="stat-value">{doneCount}</span>
          <span className="stat-label">Completos</span>
        </div>
        <div className="stat-card">
          <Zap size={18} className="stat-icon yellow"/>
          <span className="stat-value">{partialCount}</span>
          <span className="stat-label">Parciales</span>
        </div>
        <div className="stat-card">
          <Calendar size={18} className="stat-icon red"/>
          <span className="stat-value">{missedCount}</span>
          <span className="stat-label">Faltados</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">📅 Cumplimiento</h3>
        <div className="compliance-grid">
          {completionStats.map((d,i) => (
            <div key={i} className={`compliance-cell ${d.status}`} title={d.label}>
              <span className="compliance-label">{d.label}</span>
              <span className="compliance-pct">{d.pct!==null?`${d.pct}%`:'–'}</span>
            </div>
          ))}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 className="card-title">📈 Progresión de cargas (kg)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{top:5,right:10,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="day" tick={{fontSize:10,fill:'var(--text-muted)'}}/>
              <YAxis tick={{fontSize:10,fill:'var(--text-muted)'}}/>
              <Tooltip contentStyle={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              {exerciseKeys.map((key,i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={false}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="body-maps-row">
        <div className="card body-map-card">
          <BodyMap activeMuscles={todayMuscles} title="🔴 Hoy"/>
        </div>
        <div className="card body-map-card">
          <BodyMap activeMuscles={weekMuscles} title="📅 Esta semana"/>
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={() => navigate('/sesion')}>
        ▶ Registrar sesión de hoy
      </button>
    </div>
  )
}
