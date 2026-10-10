import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '6px 10px', fontSize: 11,
    }}>
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>{label}</p>
      <p style={{ color: '#a855f7', margin: 0, fontWeight: 700 }}>
        {payload[0].value} {payload[0].payload.unit}
      </p>
    </div>
  )
}

export default function ExerciseChart({ history }) {
  if (!history || history.length < 2) return null

  const data = history.map(h => ({
    date: new Date(h.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    maxWeight: h.maxWeight,
    unit: h.unit,
  }))

  return (
    <div className="ex-chart-wrap">
      <span className="ex-history-title">📈 Progreso de peso</span>
      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="maxWeight" stroke="url(#chartGrad)"
            strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#ec4899' }}
          />
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
