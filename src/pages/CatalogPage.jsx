import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { EXERCISES, MUSCLE_GROUPS } from '../data/exercises'
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react'

function genId() { return 'custom_' + Date.now().toString(36) + Math.random().toString(36).slice(2) }

const EMPTY_FORM = { name: '', muscle: 'pecho', description: '' }

export default function CatalogPage() {
  const { customExercises, saveCustomExercise, deleteCustomExercise } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [filterMuscle, setFilterMuscle] = useState('all')
  const [tab, setTab] = useState('custom')

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (ex) => { setForm({ name: ex.name, muscle: ex.muscle, description: ex.description || '' }); setEditId(ex.id); setShowForm(true) }
  const cancel = () => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null) }

  const handleSave = () => {
    if (!form.name.trim()) return
    saveCustomExercise({ id: editId || genId(), name: form.name.trim(), muscle: form.muscle, description: form.description.trim(), custom: true })
    cancel()
  }

  const allExercises = tab === 'custom' ? customExercises : EXERCISES
  const filtered = filterMuscle === 'all' ? allExercises : allExercises.filter(e => e.muscle === filterMuscle)

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="page-subtitle">Ejercicios disponibles</p>
        </div>
        {tab === 'custom' && (
          <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14}/> Nuevo</button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{border:'2px solid var(--primary)'}}>
          <h3 style={{marginBottom:12}}>{editId ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h3>
          <label className="form-label">Nombre *</label>
          <input className="form-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="ej. Press de banca con mancuernas" />
          <label className="form-label" style={{marginTop:12}}>Grupo muscular</label>
          <select className="form-input" value={form.muscle} onChange={e => setForm(p=>({...p,muscle:e.target.value}))}>
            {Object.entries(MUSCLE_GROUPS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <label className="form-label" style={{marginTop:12}}>Descripción (opcional)</label>
          <input className="form-input" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="Notas sobre el ejercicio" />
          <div style={{display:'flex',gap:8,marginTop:14}}>
            <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}><Check size={14}/> Guardar</button>
            <button className="btn btn-ghost" onClick={cancel}><X size={14}/> Cancelar</button>
          </div>
        </div>
      )}

      <div className="tab-row">
        <button className={`tab-btn ${tab==='custom'?'active':''}`} onClick={()=>setTab('custom')}>Mis ejercicios ({customExercises.length})</button>
        <button className={`tab-btn ${tab==='builtin'?'active':''}`} onClick={()=>setTab('builtin')}>Pre-cargados ({EXERCISES.length})</button>
      </div>

      <div className="muscle-filter" style={{marginBottom:12}}>
        <button className={`chip ${filterMuscle==='all'?'active':''}`} onClick={()=>setFilterMuscle('all')}>Todos</button>
        {Object.entries(MUSCLE_GROUPS).map(([k,v]) => (
          <button key={k} className={`chip ${filterMuscle===k?'active':''}`} onClick={()=>setFilterMuscle(k)}>{v.label}</button>
        ))}
      </div>

      {tab === 'custom' && filtered.length === 0 && (
        <div className="empty-state" style={{padding:'40px 0'}}>
          <span className="empty-icon">📝</span>
          <h3>Sin ejercicios personalizados</h3>
          <p>Agrega tus propios ejercicios para usarlos en tus rutinas.</p>
          <button className="btn btn-primary" style={{marginTop:12}} onClick={openNew}><Plus size={14}/> Agregar ejercicio</button>
        </div>
      )}

      {filtered.map(ex => (
        <div key={ex.id} className="card" style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14}}>{ex.name}</div>
            <div style={{fontSize:12,color:MUSCLE_GROUPS[ex.muscle]?.color,fontWeight:600}}>{MUSCLE_GROUPS[ex.muscle]?.label}</div>
            {ex.description && <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{ex.description}</div>}
          </div>
          {tab === 'custom' && (
            <div style={{display:'flex',gap:6}}>
              <button className="icon-btn" onClick={()=>openEdit(ex)}><Edit2 size={14}/></button>
              <button className="icon-btn danger" onClick={()=>deleteCustomExercise(ex.id)}><Trash2 size={14}/></button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
