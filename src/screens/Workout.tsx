import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check } from 'lucide-react'
import { db, type Routine } from '../db/db'
import { defaultWorkoutName, discardSession, finishSession, fmtDuration, fmtNum, previousOfRoutine, sessionStats, startSession } from '../db/logic'
import { Dialog, Header, Screen } from '../ui'
import posthog from '../posthog'
import { workoutLogger } from '../logging'

export const openSession = () => db.sessions.where('status').anyOf('active', 'paused').first()

/** Antes de empezar, si hay un entrenamiento sin terminar, se pregunta qué hacer con él. */
export function useStartGuard() {
  const nav = useNavigate()
  const open = useLiveQuery(openSession, [])
  const [pending, setPending] = useState<null | (() => Promise<void>)>(null)
  const guard = (fn: () => Promise<void>) => { if (open) setPending(() => fn); else fn() }
  const dialog = pending && open ? (
    <Dialog title="Tienes un entrenamiento sin terminar" body={`«${open.name}» sigue abierto. Si empiezas otro, se descartará.`} onClose={() => setPending(null)}>
      <button className="btn btn-primary" onClick={() => nav('/sesion')}>Continuar «{open.name}»</button>
      <button className="btn btn-secondary" onClick={async () => { const f = pending; setPending(null); posthog.capture('workout_discarded', { completed_set_count: sessionStats(open).sets, reason: 'new_workout_started' }); await f() }}>Descartar y empezar</button>
    </Dialog>
  ) : null
  return { guard, dialog }
}

export async function startRoutine(r: Routine) {
  await startSession({ routine: r, name: r.name, description: r.description })
  posthog.capture('workout_started', { workout_type: 'routine', exercise_count: r.exerciseIds.length })
  workoutLogger.started('routine', r.exerciseIds.length)
}

/* N1 · Nuevo entrenamiento */
export function NewWorkout() {
  const nav = useNavigate()
  const [name, setName] = useState(defaultWorkoutName())
  const [desc, setDesc] = useState('')
  const { guard, dialog } = useStartGuard()
  const go = () => guard(async () => { await startSession({ name: name.trim() || defaultWorkoutName(), description: desc.trim() || undefined }); posthog.capture('workout_started', { workout_type: 'new' }); workoutLogger.started('new'); nav('/ejercicios?modo=sesion', { replace: true }) })
  return (
    <Screen>
      <Header title="Nuevo entrenamiento" />
      <div className="body">Se guardará como rutina para que la repitas la próxima vez.</div>
      <div className="field">
        <label htmlFor="name">Nombre de la rutina</label>
        <input id="name" className="input" value={name} onChange={e => setName(e.target.value)} onFocus={e => e.target.select()} />
        <span className="helper">Puedes cambiarlo al terminar.</span>
      </div>
      <div className="field">
        <label htmlFor="desc">Descripción (opcional)</label>
        <input id="desc" className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej.: pecho y tríceps" />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={go}>Elegir primer ejercicio</button>
      {dialog}
    </Screen>
  )
}

/* 35 / N5 · Terminar */
export function FinishWorkout() {
  const nav = useNavigate()
  const s = useLiveQuery(openSession, [])
  const [name, setName] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (s === null) nav('/', { replace: true }) }, [s, nav])
  if (!s) return <div className="screen" />
  const st = sessionStats(s)
  const n = name ?? s.name

  if (st.sets === 0) return (
    <Screen>
      <Dialog title="No registraste ninguna serie" body="Esta sesión no tiene series marcadas con ✓, así que no hay nada que guardar en tu historial." onClose={() => nav('/sesion')}>
        <button className="btn btn-primary" onClick={() => nav('/sesion')}>Volver al entrenamiento</button>
        <button className="btn btn-destructive" onClick={async () => { await discardSession(s.id); posthog.capture('workout_discarded', { completed_set_count: 0 }); nav('/', { replace: true }) }}>Descartar sesión</button>
      </Dialog>
    </Screen>
  )

  async function save() {
    setSaving(true)
    const id = s!.id
    await finishSession(id, { name: n, notes: notes.trim() || undefined })
    const workoutType = s!.isNewRoutine ? 'new' : 'routine'
    const durationSeconds = Math.round(st.duration / 1000)
    posthog.capture('workout_completed', {
      workout_type: workoutType,
      completed_set_count: st.sets,
      exercise_count: st.exercises,
      duration_seconds: durationSeconds,
      volume_kg: st.volumeKg,
    })
    workoutLogger.completed({
      workoutType,
      completedSetCount: st.sets,
      exerciseCount: st.exercises,
      durationSeconds,
      volumeKg: st.volumeKg,
    })
    nav(`/sesion/listo/${id}`, { replace: true })
  }

  return (
    <Screen>
      <Header title={s.isNewRoutine ? 'Terminar entrenamiento' : 'Finalizar entrenamiento'} />
      <div className="body">Revisa tu sesión antes de guardarla.</div>
      {s.isNewRoutine && (
        <div className="field">
          <label htmlFor="rn">Nombre de la rutina</label>
          <input id="rn" className="input" value={n} onChange={e => setName(e.target.value)} />
          <span className="helper">Así la encontrarás para repetirla.</span>
        </div>
      )}
      <div className="grid2">
        <div className="stat"><div className="overline">Duración</div><div className="v">{fmtDuration(st.duration)}</div></div>
        <div className="stat"><div className="overline">Series</div><div className="v">{s.isNewRoutine ? st.sets : `${st.sets} / ${st.total}`}</div></div>
        <div className="stat"><div className="overline">Ejercicios</div><div className="v">{s.isNewRoutine ? st.exercises : `${st.exercises} / ${s.entries.length}`}</div></div>
        <div className="stat"><div className="overline">Volumen</div><div className="v">{fmtNum(st.volumeKg)} <span style={{ fontSize: 18 }}>kg</span></div></div>
      </div>
      <div className="field">
        <label htmlFor="notes">Notas del entrenamiento (opcional)</label>
        <textarea id="notes" className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="¿Cómo te sentiste hoy?" />
      </div>
      <div className="spacer" />
      <button className="btn btn-primary" disabled={saving} onClick={save}>{s.isNewRoutine ? 'Guardar rutina' : 'Guardar entrenamiento'}</button>
      <button className="btn btn-tertiary" onClick={() => nav('/sesion')}>Seguir entrenando</button>
    </Screen>
  )
}

/* 36 / 36b · Entrenamiento finalizado */
export function WorkoutDone() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useLiveQuery(() => db.sessions.get(id!), [id])
  const prev = useLiveQuery(async () => (s && !s.isNewRoutine && s.routineId ? previousOfRoutine(s.routineId, s.id) : null), [s])
  if (!s) return <div className="screen" />
  const st = sessionStats(s)
  const ps = prev ? sessionStats(prev) : null
  return (
    <Screen>
      <div className="empty-state" style={{ paddingTop: 40 }}>
        <div className="empty-ic" style={{ width: 96, height: 96 }}><Check size={48} /></div>
        <div className="h3">{s.isNewRoutine ? 'Rutina guardada' : 'Entrenamiento finalizado'}</div>
        <div className="body">{s.isNewRoutine ? `«${s.name}» ya está en Mis rutinas. La próxima vez verás aquí tu progreso.` : `Tu sesión de ${s.name} se guardó en el historial.`}</div>
      </div>
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div><div className="overline">Duración</div><div className="h3">{fmtDuration(st.duration)}</div></div>
        <div><div className="overline">Series</div><div className="h3">{st.sets}</div></div>
        <div><div className="overline">Ejercicios</div><div className="h3">{st.exercises}</div></div>
      </div>
      {ps && prev && (
        <div className="card stack" style={{ gap: 8 }}>
          <div className="title" style={{ fontWeight: 600 }}>Frente a tu sesión anterior ({new Date(prev.endedAt!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })})</div>
          <div className="body" style={{ color: 'var(--text-primary)' }}>Series completadas: {ps.sets} → {st.sets}</div>
          <div className="body" style={{ color: 'var(--text-primary)' }}>Volumen total: {fmtNum(ps.volumeKg)} kg → {fmtNum(st.volumeKg)} kg</div>
          <div className="caption" style={{ fontWeight: 400 }}>Solo comparamos sesiones de la misma rutina.</div>
        </div>
      )}
      <div className="spacer" />
      <button className="btn btn-primary" onClick={() => nav('/', { replace: true })}>Volver al inicio</button>
      <button className="btn btn-secondary" onClick={() => nav(`/historial/${s.id}`, { replace: true })}>Ver en el historial</button>
    </Screen>
  )
}
