import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ensureSeed, getPrefs } from './db/logic'
import SessionScreen from './screens/Session'
import { CreateExercise, ExerciseDetail, ExercisePicker } from './screens/Exercises'
import { FinishWorkout, NewWorkout, WorkoutDone } from './screens/Workout'
import { Home, RoutineDetail, Routines, Train } from './screens/Main'
import { ExerciseProgress, HistoryList, Progress, SessionDetail } from './screens/History'
import { Install, Preferences, Profile, Welcome } from './screens/Profile'

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent)

/** Primer arranque: instalar (si se abre en el navegador del teléfono) y luego el nombre. */
function Gate({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const [state, setState] = useState<null | { path: string; needsName: boolean; needsInstall: boolean }>(null)
  useEffect(() => {
    const path = loc.pathname
    getPrefs().then(p => setState({ path, needsName: !p.name, needsInstall: !p.installDismissed && isMobile() && !isStandalone() }))
  }, [loc.pathname])
  // Se decide con datos leídos para esta ruta, no con los de la anterior.
  if (!state) return null
  if (state.path !== loc.pathname && (state.needsName || state.needsInstall)) return null
  const free = ['/instalar', '/bienvenida']
  if (!free.includes(loc.pathname)) {
    if (state.needsInstall) return <Navigate to="/instalar" replace />
    if (state.needsName) return <Navigate to="/bienvenida" replace />
  }
  return <>{children}</>
}

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => { ensureSeed().finally(() => setReady(true)) }, [])
  if (!ready) return null
  return (
    <BrowserRouter>
      <Gate>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instalar" element={<Install />} />
          <Route path="/bienvenida" element={<Welcome />} />
          <Route path="/rutinas" element={<Routines />} />
          <Route path="/rutinas/:id" element={<RoutineDetail />} />
          <Route path="/entrenar" element={<Train />} />
          <Route path="/nuevo" element={<NewWorkout />} />
          <Route path="/ejercicios" element={<ExercisePicker />} />
          <Route path="/ejercicios/nuevo" element={<CreateExercise />} />
          <Route path="/ejercicios/:id" element={<ExerciseDetail />} />
          <Route path="/sesion" element={<SessionScreen />} />
          <Route path="/sesion/terminar" element={<FinishWorkout />} />
          <Route path="/sesion/listo/:id" element={<WorkoutDone />} />
          <Route path="/historial" element={<HistoryList />} />
          <Route path="/historial/:id" element={<SessionDetail />} />
          <Route path="/progreso" element={<Progress />} />
          <Route path="/progreso/:id" element={<ExerciseProgress />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/perfil/preferencias" element={<Preferences />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Gate>
    </BrowserRouter>
  )
}
