import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)
const STORAGE_KEY = 'gymtracker_data'

const defaultData = { routines: [], sessions: [], activeRoutineIds: [], customExercises: [] }

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('gymtracker_theme') || 'dark')
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem('gymtracker_unit') || 'kg')
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      const parsed = s ? JSON.parse(s) : defaultData
      // Migrate: old single activeRoutineId → array
      if (parsed.activeRoutineId && !parsed.activeRoutineIds) {
        parsed.activeRoutineIds = [parsed.activeRoutineId]
      }
      if (!Array.isArray(parsed.activeRoutineIds)) {
        parsed.activeRoutineIds = parsed.activeRoutineId ? [parsed.activeRoutineId] : []
      }
      return { ...defaultData, ...parsed }
    } catch { return defaultData }
  })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])

  useEffect(() => {
    localStorage.setItem('gymtracker_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('gymtracker_unit', weightUnit)
  }, [weightUnit])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleWeightUnit = () => setWeightUnit(u => u === 'kg' ? 'lbs' : 'kg')

  const saveRoutine = (routine) =>
    setData(p => ({ ...p, routines: [...p.routines.filter(r => r.id !== routine.id), routine] }))

  const startRoutine = (id) =>
    setData(p => ({
      ...p,
      activeRoutineIds: p.activeRoutineIds.includes(id) ? p.activeRoutineIds : [...p.activeRoutineIds, id],
      routines: p.routines.map(r => r.id === id ? { ...r, status: 'active', startDate: new Date().toISOString() } : r),
    }))

  const completeRoutine = (id, endWeight) =>
    setData(p => ({
      ...p,
      activeRoutineIds: p.activeRoutineIds.filter(rid => rid !== id),
      routines: p.routines.map(r => r.id === id ? { ...r, status: 'completed', endDate: new Date().toISOString(), endWeight } : r),
    }))

  const deleteRoutine = (id) =>
    setData(p => ({
      ...p,
      activeRoutineIds: p.activeRoutineIds.filter(rid => rid !== id),
      routines: p.routines.filter(r => r.id !== id),
      sessions: p.sessions.filter(s => s.routineId !== id),
    }))

  // Remove from active list without deleting routine data or sessions
  const stopRoutine = (id) =>
    setData(p => ({
      ...p,
      activeRoutineIds: p.activeRoutineIds.filter(rid => rid !== id),
      routines: p.routines.map(r => r.id === id ? { ...r, status: 'idle' } : r),
    }))

  const saveSession = (session) =>
    setData(p => ({ ...p, sessions: [...p.sessions.filter(s => s.id !== session.id), session] }))

  // Returns all active routines (array)
  const getActiveRoutines = () =>
    data.activeRoutineIds.map(id => data.routines.find(r => r.id === id)).filter(Boolean)

  // Backward-compat: returns first active routine or null
  const getActiveRoutine = () => getActiveRoutines()[0] || null

  const getRoutineSessions = (id) => data.sessions.filter(s => s.routineId === id)

  const getLastExerciseRecord = (exerciseId) => {
    const sorted = [...data.sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
    for (const session of sorted) {
      const rec = session.records?.find(r => r.exerciseId === exerciseId)
      if (rec) return { session, record: rec }
    }
    return null
  }

  const saveCustomExercise = (ex) =>
    setData(p => ({ ...p, customExercises: [...p.customExercises.filter(e => e.id !== ex.id), ex] }))

  const deleteCustomExercise = (id) =>
    setData(p => ({ ...p, customExercises: p.customExercises.filter(e => e.id !== id) }))

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      weightUnit, toggleWeightUnit,
      data, routines: data.routines, sessions: data.sessions,
      activeRoutineIds: data.activeRoutineIds,
      // backward-compat
      activeRoutineId: data.activeRoutineIds[0] || null,
      customExercises: data.customExercises || [],
      saveRoutine, startRoutine, completeRoutine, deleteRoutine, stopRoutine,
      saveSession, getActiveRoutine, getActiveRoutines, getRoutineSessions,
      getLastExerciseRecord,
      saveCustomExercise, deleteCustomExercise,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
