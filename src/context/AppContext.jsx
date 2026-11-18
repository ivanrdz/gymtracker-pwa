import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

// ── Helpers: convert between local shape ↔ DB row ───────────────────────────
function routineToRow(r, userId) {
  return {
    id: r.id,
    user_id: userId,
    name: r.name,
    routine_type: r.type || r.routineType || null,
    duration_weeks: r.durationWeeks || 4,
    status: r.status || 'active',
    days: r.days || [],
    start_date: r.startDate || new Date().toISOString(),
    end_date: r.endDate || null,
  }
}
function rowToRoutine(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.routine_type,
    routineType: row.routine_type,
    durationWeeks: row.duration_weeks,
    status: row.status,
    days: row.days || [],
    startDate: row.start_date,
    endDate: row.end_date,
  }
}
function sessionToRow(s, userId) {
  const d = s.date
    ? (typeof s.date === 'string' && s.date.length === 10 ? s.date : new Date(s.date).toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0]
  return {
    id: s.id,
    user_id: userId,
    routine_id: s.routineId || null,
    date: d,
    records: s.records || [],
  }
}
function rowToSession(row) {
  return {
    id: row.id,
    routineId: row.routine_id,
    date: row.date,
    records: row.records || [],
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)

  const [theme, setTheme] = useState(() => localStorage.getItem('gymtracker_theme') || 'dark')
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem('gymtracker_unit') || 'kg')

  const [routines, setRoutines]   = useState([])
  const [sessions, setSessions]   = useState([])
  const [customExercises, setCustomExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gymtracker_custom_exercises') || '[]') } catch { return [] }
  })

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load data when user changes ───────────────────────────────────────────
  useEffect(() => {
    if (!user) { setRoutines([]); setSessions([]); return }
    loadData(user.id)
  }, [user])

  const loadData = async (uid) => {
    setDataLoading(true)
    const [{ data: rd }, { data: sd }] = await Promise.all([
      supabase.from('routines').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').eq('user_id', uid).order('date', { ascending: false }),
    ])
    setRoutines((rd || []).map(rowToRoutine))
    setSessions((sd || []).map(rowToSession))
    setDataLoading(false)
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }
  const signOut = async () => { await supabase.auth.signOut() }

  // ── Theme / unit ──────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('gymtracker_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('gymtracker_unit', weightUnit) }, [weightUnit])

  const toggleTheme      = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleWeightUnit = () => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg')

  // ── CRUD: routines ────────────────────────────────────────────────────────
  const saveRoutine = async (routine) => {
    if (!user) return
    // optimistic update
    setRoutines(prev => [...prev.filter(r => r.id !== routine.id), routine])
    const { data, error } = await supabase.from('routines').upsert(routineToRow(routine, user.id)).select().single()
    if (!error && data) setRoutines(prev => [...prev.filter(r => r.id !== data.id), rowToRoutine(data)])
  }

  const startRoutine = async (id) => {
    const now = new Date().toISOString()
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: 'active', startDate: now } : r))
    if (user) await supabase.from('routines').update({ status: 'active', start_date: now }).eq('id', id)
  }

  const completeRoutine = async (id, endWeight) => {
    const now = new Date().toISOString()
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: 'completed', endDate: now, endWeight } : r))
    if (user) await supabase.from('routines').update({ status: 'completed', end_date: now }).eq('id', id)
  }

  const deleteRoutine = async (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id))
    setSessions(prev => prev.filter(s => s.routineId !== id))
    if (user) await supabase.from('routines').delete().eq('id', id)
  }

  const stopRoutine = async (id) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, status: 'idle' } : r))
    if (user) await supabase.from('routines').update({ status: 'idle' }).eq('id', id)
  }

  // ── CRUD: sessions ────────────────────────────────────────────────────────
  const saveSession = async (session) => {
    if (!user) return
    setSessions(prev => [...prev.filter(s => s.id !== session.id), session])
    const { data, error } = await supabase.from('sessions').upsert(sessionToRow(session, user.id)).select().single()
    if (!error && data) setSessions(prev => [...prev.filter(s => s.id !== data.id), rowToSession(data)])
  }

  // ── CRUD: custom exercises (localStorage only for now) ────────────────────
  const saveCustomExercise = (ex) => {
    const updated = [...customExercises.filter(e => e.id !== ex.id), ex]
    setCustomExercises(updated)
    localStorage.setItem('gymtracker_custom_exercises', JSON.stringify(updated))
  }
  const deleteCustomExercise = (id) => {
    const updated = customExercises.filter(e => e.id !== id)
    setCustomExercises(updated)
    localStorage.setItem('gymtracker_custom_exercises', JSON.stringify(updated))
  }

  // ── Sharing ───────────────────────────────────────────────────────────────
  const shareRoutine = async (routineId, toEmail) => {
    if (!user) return { error: 'No autenticado' }
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return { error: 'Rutina no encontrada' }
    const { error } = await supabase.from('routine_shares').insert({
      from_user_id: user.id,
      to_email: toEmail.toLowerCase().trim(),
      routine_snapshot: routine,
      status: 'pending',
    })
    return { error: error?.message }
  }

  const getReceivedShares = async () => {
    if (!user) return []
    const { data } = await supabase
      .from('routine_shares')
      .select('*')
      .eq('to_email', user.email.toLowerCase())
      .order('created_at', { ascending: false })
    return data || []
  }

  const acceptShare = async (shareId, routineSnapshot) => {
    if (!user) return
    const newRoutine = {
      ...routineSnapshot,
      id: crypto.randomUUID(),
      status: 'idle',
      startDate: null,
      endDate: null,
    }
    await saveRoutine(newRoutine)
    await supabase.from('routine_shares').update({ status: 'accepted' }).eq('id', shareId)
    return newRoutine
  }

  const rejectShare = async (shareId) => {
    await supabase.from('routine_shares').update({ status: 'rejected' }).eq('id', shareId)
  }

  // ── Derived / helpers ─────────────────────────────────────────────────────
  const activeRoutineIds = routines.filter(r => r.status === 'active').map(r => r.id)
  const getActiveRoutines = () => routines.filter(r => r.status === 'active')
  const getActiveRoutine  = () => getActiveRoutines()[0] || null
  const getRoutineSessions = (id) => sessions.filter(s => s.routineId === id)

  const getLastExerciseRecord = (exerciseId) => {
    const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
    for (const session of sorted) {
      const rec = session.records?.find(r => r.exerciseId === exerciseId)
      if (rec) return { session, record: rec }
    }
    return null
  }

  const getStreak = () => {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map(s => new Date(s.date).toDateString()))]
      .map(d => new Date(d))
      .sort((a, b) => b - a)
    let streak = 0
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0)
    for (const d of dates) {
      const day = new Date(d); day.setHours(0, 0, 0, 0)
      const diff = Math.round((cursor - day) / 86400000)
      if (diff <= 1) { streak++; cursor = day }
      else break
    }
    return streak
  }

  const getExerciseHistory = (exerciseId) => {
    const results = []
    sessions.forEach(session => {
      const rec = session.records?.find(r => r.exerciseId === exerciseId)
      if (!rec || !Array.isArray(rec.sets)) return
      const maxWeight   = Math.max(...rec.sets.map(s => s.weight || 0))
      const totalVolume = rec.sets.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
      results.push({ date: session.date, maxWeight, totalVolume, unit: rec.unit || 'kg' })
    })
    return results.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getExercisePR = (exerciseId) => {
    const history = getExerciseHistory(exerciseId)
    if (!history.length) return null
    return history.reduce((best, h) => h.maxWeight > best.maxWeight ? h : best)
  }

  // backward-compat: expose data object some pages may still read
  const data = { routines, sessions, activeRoutineIds, customExercises }

  return (
    <AppContext.Provider value={{
      // auth
      user, authLoading, dataLoading, signIn, signOut,
      // preferences
      theme, toggleTheme,
      weightUnit, toggleWeightUnit,
      // data (direct + compat)
      data, routines, sessions,
      activeRoutineIds,
      activeRoutineId: activeRoutineIds[0] || null,
      customExercises,
      // mutations
      saveRoutine, startRoutine, completeRoutine, deleteRoutine, stopRoutine,
      saveSession,
      saveCustomExercise, deleteCustomExercise,
      // helpers
      getActiveRoutine, getActiveRoutines, getRoutineSessions,
      getLastExerciseRecord,
      getStreak, getExerciseHistory, getExercisePR,
      // sharing
      shareRoutine, getReceivedShares, acceptShare, rejectShare,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
