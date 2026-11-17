import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Send, Inbox, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

export default function SharePage() {
  const [tab, setTab] = useState('send')
  return (
    <div className="page-container">
      <h2 className="page-title">Compartir Rutinas</h2>
      <div className="share-tabs">
        <button className={`share-tab ${tab === 'send' ? 'active' : ''}`} onClick={() => setTab('send')}>
          <Send size={16} /> Enviar
        </button>
        <button className={`share-tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => setTab('inbox')}>
          <Inbox size={16} /> Recibidas
        </button>
      </div>
      {tab === 'send'  && <SendTab />}
      {tab === 'inbox' && <InboxTab />}
    </div>
  )
}

function SendTab() {
  const { routines, shareRoutine } = useApp()
  const activeOpts = routines.filter(r => r.status !== 'completed')
  const [routineId, setRoutineId] = useState('')
  const [email, setEmail]         = useState('')
  const [status, setStatus]       = useState(null) // 'ok' | 'err' | null
  const [msg, setMsg]             = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!routineId || !email) return
    setLoading(true)
    const { error } = await shareRoutine(routineId, email)
    setLoading(false)
    if (error) { setStatus('err'); setMsg('Error al enviar: ' + error) }
    else { setStatus('ok'); setMsg('¡Rutina enviada! El destinatario la verá en su bandeja de entrada.'); setEmail(''); setRoutineId('') }
    setTimeout(() => setStatus(null), 4000)
  }

  return (
    <div className="share-panel">
      <p className="share-desc">Selecciona una rutina y escribe el email del usuario al que se la quieres enviar.</p>
      <form className="share-form" onSubmit={handleSend}>
        <div className="share-field">
          <label>Rutina a enviar</label>
          <div className="share-select-wrap">
            <select value={routineId} onChange={e => setRoutineId(e.target.value)} required>
              <option value="">Selecciona una rutina…</option>
              {activeOpts.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="share-select-icon" />
          </div>
        </div>

        <div className="share-field">
          <label>Email del destinatario</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            required
          />
        </div>

        {status && (
          <div className={`share-feedback ${status}`}>
            {status === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {msg}
          </div>
        )}

        <button type="submit" className="share-btn" disabled={loading || !routineId || !email}>
          {loading ? <span className="login-spinner small" /> : <><Send size={16} /> Enviar rutina</>}
        </button>
      </form>
    </div>
  )
}

function InboxTab() {
  const { getReceivedShares, acceptShare, rejectShare } = useApp()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)

  const load = async () => {
    setLoading(true)
    const data = await getReceivedShares()
    setShares(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAccept = async (share) => {
    setWorking(share.id)
    await acceptShare(share.id, share.routine_snapshot)
    await load()
    setWorking(null)
  }

  const handleReject = async (share) => {
    setWorking(share.id)
    await rejectShare(share.id)
    await load()
    setWorking(null)
  }

  const statusIcon = (s) => ({
    pending:  <Clock size={14} className="share-status pending" />,
    accepted: <CheckCircle size={14} className="share-status accepted" />,
    rejected: <XCircle size={14} className="share-status rejected" />,
  }[s] || null)

  if (loading) return <div className="share-loading">Cargando…</div>
  if (!shares.length) return (
    <div className="share-empty">
      <Inbox size={40} />
      <p>No tienes rutinas recibidas todavía.</p>
    </div>
  )

  return (
    <div className="share-inbox">
      {shares.map(share => (
        <div key={share.id} className={`share-item ${share.status}`}>
          <div className="share-item-header">
            {statusIcon(share.status)}
            <strong>{share.routine_snapshot?.name || 'Rutina'}</strong>
          </div>
          <div className="share-item-meta">
            De: {share.from_user_id?.slice(0, 8)}…
            &nbsp;·&nbsp;
            {new Date(share.created_at).toLocaleDateString('es-MX')}
          </div>
          {share.routine_snapshot?.days?.length > 0 && (
            <div className="share-item-days">
              {share.routine_snapshot.days.map((d, i) => (
                <span key={i} className="share-day-chip">{d.label || d.id}</span>
              ))}
            </div>
          )}
          {share.status === 'pending' && (
            <div className="share-item-actions">
              <button
                className="share-accept"
                onClick={() => handleAccept(share)}
                disabled={working === share.id}
              >
                <CheckCircle size={14} /> Aceptar
              </button>
              <button
                className="share-reject"
                onClick={() => handleReject(share)}
                disabled={working === share.id}
              >
                <XCircle size={14} /> Rechazar
              </button>
            </div>
          )}
          {share.status === 'accepted' && <p className="share-done-msg">✓ Agregada a tus rutinas</p>}
          {share.status === 'rejected' && <p className="share-done-msg muted">Rechazada</p>}
        </div>
      ))}
    </div>
  )
}
