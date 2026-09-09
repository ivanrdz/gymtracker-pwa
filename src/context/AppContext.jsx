import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)
const STORAGE_KEY = 'gymtracker_data'

const defaultData = { routines: [], sessions: [], activeRoutineId: null, customExercises: [] }

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('gymtracker_theme') || 'dark')
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      const parsed = s ? JSON.parse(s) : defaultData
      return { ...defaultData, ...parsed }
    } catch { return defaultData }
  })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])

  useEffect(() => {
    localStorage.setItem('gymtracker_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const saveRoutine = (routine) =>
    setData(p => ({ ...p, routines: [...p.routines.filter(r => r.id !== routine.id), routine] }))

  const startRoutine = (id) =>
    setData(p => ({
      ...p,
      activeRoutineId: id,
      routines: p.routines.map(r => r.id === id ? { ...r, status: 'active', startDate: new Date().toISOString() } : r),
    }))

  const completeRoutine = (id, endWeight) =>
    setData(p => ({
      ...p,
      activeRoutineId: p.activeRoutineId === id ? null : p.activeRoutineId,
      routines: p.routines.map(r => r.id === id ? { ...r, status: 'completed', endDate: new Date().toISOString(), endWeight } : r),
    }))

  const deleteRoutine = (id) =>
    setData(p => ({
      ...p,
      activeRoutineId: p.activeRoutineId === id ? null : p.activeRoutineId,
      routines: p.routines.filter(r => r.id !== id),
      sessions: p.sessions.filter(s => s.routineId !== id),
    }))

  const saveSession = (session) =>
    setData(p => ({ ...p, sessions: [...p.sessions.filter(s => s.id !== session.id), session] }))

  const getActiveRoutine = () => data.routines.find(r => r.id === data.activeRoutineId) || null
  const getRoutineSessions = (id) => data.sessions.filter(s => s.routineId === id)

  const saveCustomExercise = (ex) =>
    setData(p => ({ ...p, customExercises: [...p.customExercises.filter(e => e.id !== ex.id), ex] }))

  const deleteCustomExercise = (id) =>
    setData(p => ({ ...p, customExercises: p.customExercises.filter(e => e.id !== id) }))

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      data, routines: data.routines, sessions: data.sessions,
      activeRoutineId: data.activeRoutineId,
      customExercises: data.customExercises || [],
      saveRoutine, startRoutine, completeRoutine, deleteRoutine,
      saveSession, getActiveRoutine, getRoutineSessions,
      saveCustomExercise, deleteCustomExercise,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
