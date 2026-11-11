import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Dumbbell, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { db, type Routine, type Session } from '../db/db'
import { discardSession, fmtDate, fmtDuration, fmtNum, getPrefs, lastPerformance, sessionStats } from '../db/logic'
import { Dialog, EmptyState, Header, Screen, Sheet, Thumb } from '../ui'
import { openSession, startRoutine, useStartGuard } from './Workout'
import { track } from '../analytics'

function ago(t?: number) {
  if (!t) return 'sin usar'
  const d = Math.floor((Date.now() - t) / 86400000)
  if (d <= 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  if (d < 14) return 'hace 1 semana'
  if (d < 30) return `hace ${Math.floor(d / 7)} semanas`
  return `hace ${Math.floor(d / 30)} ${d < 60 ? 'mes' : 'meses'}`
}
const routinesSorted = async () => (await db.routines.toArray()).sort((a, b) => (b.lastUsedAt ?? b.updatedAt) - (a.lastUsedAt ?? a.updatedAt))

function OpenSessionCard({ s }: { s: Session }) {
  const nav = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const st = sessionStats(s)
  return (
    <div className="card stack" style={{ borderColor: 'var(--brand)', borderRadius: 20 }}>
      <div className="row" style={{ gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand)' }} /><span className="overline brand">Entrenamiento sin terminar</span></div>
      <div><div className="h3" style={{ fontSize: 17 }}>{s.name}</div><div className="label" style={{ fontWeight: 400, marginTop: 4 }}>{s.isNewRoutine ? `${st.exercises} ejercicios · ${st.sets} series` : `${st.sets} de ${st.total} series`} · {fmtDuration(st.duration)}</div></div>
      {!s.isNewRoutine && <div className="progress" style={{ height: 6 }}><div style={{ width: `${st.total ? (st.sets / st.total) * 100 : 0}%` }} /></div>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => nav('/sesion')}>Continuar</button>
        <button className="btn btn-tertiary" style={{ height: 52 }} onClick={() => setConfirm(true)}>Descartar</button>
      </div>
      {confirm && (
        <Dialog title="¿Descartar la sesión?" body={`Se eliminarán las ${st.sets} series registradas. Esta acción no se puede deshacer.`} onClose={() => setConfirm(false)}>
          <button className="btn btn-destructive" onClick={() => { track('session_discarded', { sets_done: st.sets, where: 'home' }); discardSession(s.id) }}>Descartar</button>
          <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Volver</button>
        </Dialog>
      )}
    </div>
  )
}

function RoutineCard({ r }: { r: Routine }) {
  const nav = useNavigate()
  return (
    <button className="list-card" onClick={() => nav(`/rutinas/${r.id}`)}>
      <div className="grow"><div className="name">{r.name}</div><div className="meta">{r.exerciseIds.length} ejercicios · usada {ago(r.lastUsedAt)}</div></div>
      <ChevronRight size={20} className="muted" />
    </button>
  )
}

/* 14 / 15 / 15b · Inicio */
export function Home() {
  const nav = useNavigate()
  const prefs = useLiveQuery(getPrefs, [])
  const open = useLiveQuery(openSession, [])
  const routines = useLiveQuery(routinesSorted, [])
  const done = useLiveQuery(() => db.sessions.where('status').equals('done').toArray(), [])
  const { guard, dialog } = useStartGuard()
  if (!routines || !done || prefs === undefined) return <Screen nav>{null}</Screen>

  const weekStart = (() => { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day); return d.getTime() })()
  const thisWeek = done.filter(s => (s.endedAt ?? 0) >= weekStart).length
  const last = [...done].sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))[0]
  const next = routines[0]

  return (
    <Screen nav>
      <div>
        <div className="h1">Hola{prefs.name ? `, ${prefs.name}` : ''}</div>
        <div className="body" style={{ marginTop: 4 }}>{open ? 'Tienes un entrenamiento a medias.' : routines.length ? `¿Repetimos ${next.name}?` : 'Aún no tienes rutinas. Empecemos por la primera.'}</div>
      </div>
      {open && <OpenSessionCard s={open} />}

      {routines.length === 0 && !open ? (
        <div className="card" style={{ paddingTop: 24 }}>
          <EmptyState icon={<Dumbbell size={32} />} title="Todavía no hay rutinas" body="Empieza a entrenar y tu rutina se arma sola con los ejercicios que hagas.">
            <button className="btn btn-primary" onClick={() => nav('/nuevo')}>Empezar entrenamiento</button>
            <button className="btn btn-tertiary" onClick={() => nav('/ejercicios')}>Explorar ejercicios</button>
          </EmptyState>
        </div>
      ) : (<>
        {!open && next && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #10302f 0%, #131a1c 70%)', borderRadius: 20, padding: 20 }}>
            <div className="overline brand">Tu última rutina</div>
            <div className="h2" style={{ marginTop: 8 }}>{next.name}</div>
            <div className="body" style={{ marginTop: 6 }}>{next.exerciseIds.length} ejercicios · usada {ago(next.lastUsedAt)}</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => guard(async () => { await startRoutine(next); nav('/sesion') })}>Comenzar entrenamiento</button>
          </div>
        )}
        <div className="grid2">
          <div className="stat"><div className="overline">Esta semana</div><div className="v">{thisWeek}</div><div className="caption">entrenamientos</div></div>
          <button className="stat" style={{ textAlign: 'left' }} onClick={() => last && nav(`/historial/${last.id}`)}>
            <div className="overline">Última sesión</div>
            {last ? (<><div className="title brand" style={{ fontWeight: 600, marginTop: 6 }}>{last.name}</div><div className="caption" style={{ marginTop: 4 }}>{fmtDate(last.endedAt!)} · {sessionStats(last).sets} series</div></>) : <div className="caption" style={{ marginTop: 8 }}>Aún no hay sesiones</div>}
          </button>
        </div>
        {routines.length > 1 && (<>
          <div className="row" style={{ justifyContent: 'space-between' }}><div className="title" style={{ fontWeight: 600 }}>Rutinas recientes</div><button className="link" style={{ fontSize: 14 }} onClick={() => nav('/rutinas')}>Ver todas</button></div>
          {routines.slice(1, 3).map(r => <RoutineCard key={r.id} r={r} />)}
        </>)}
      </>)}
      {dialog}
    </Screen>
  )
}

/* 17 · Mis rutinas */
export function Routines() {
  const nav = useNavigate()
  const routines = useLiveQuery(routinesSorted, [])
  return (
    <Screen nav>
      <div><div className="h1">Mis rutinas</div><div className="body" style={{ marginTop: 4 }}>Toca una rutina para verla o empezarla.</div></div>
      {routines && routines.length === 0 && (
        <EmptyState icon={<Dumbbell size={30} />} title="Aún no tienes rutinas" body="Tu primera rutina se crea mientras entrenas." />
      )}
      {routines?.map(r => <RoutineCard key={r.id} r={r} />)}
      <button className="btn btn-primary" onClick={() => nav('/nuevo')}>Empezar entrenamiento</button>
    </Screen>
  )
}

/* 25 · Entrenar */
export function Train() {
  const nav = useNavigate()
  const routines = useLiveQuery(routinesSorted, [])
  const open = useLiveQuery(openSession, [])
  return (
    <Screen nav>
      <div><div className="h1">Entrenar</div><div className="body" style={{ marginTop: 4 }}>Elige una rutina o empieza un entrenamiento nuevo.</div></div>
      {open && <OpenSessionCard s={open} />}
      {routines?.map(r => <RoutineCard key={r.id} r={r} />)}
      <button className="btn btn-primary" onClick={() => nav('/nuevo')}>Empezar entrenamiento nuevo</button>
    </Screen>
  )
}

/* 26 · Resumen previo de una rutina */
export function RoutineDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const r = useLiveQuery(() => db.routines.get(id!), [id])
  const rows = useLiveQuery(async () => {
    if (!r) return []
    const exs = await db.exercises.bulkGet(r.exerciseIds)
    return Promise.all(exs.map(async (e, i) => {
      const last = await lastPerformance(r.exerciseIds[i])
      const reps = last?.sets.map(s => s.reps).filter(Boolean) as number[] | undefined
      const top = last?.sets.reduce((m, s) => Math.max(m, s.weight ?? 0), 0)
      return { id: r.exerciseIds[i], name: e?.name ?? 'Ejercicio', meta: last ? `${last.sets.length} × ${reps?.length ? (Math.min(...reps) === Math.max(...reps) ? reps[0] : `${Math.min(...reps)}–${Math.max(...reps)}`) : '—'}${top ? ` · ${fmtNum(top)} ${last.unit}` : ''}` : 'Sin registros' }
    }))
  }, [r])
  const [menu, setMenu] = useState<null | 'menu' | 'rename' | 'delete'>(null)
  const [newName, setNewName] = useState('')
  const { guard, dialog } = useStartGuard()
  if (r === undefined) return <Screen><Header /></Screen>
  if (r === null) { nav('/rutinas', { replace: true }); return null }

  return (
    <Screen>
      <Header title="Rutina" right={<button className="icon-btn" aria-label="Opciones" onClick={() => setMenu('menu')}><MoreHorizontal size={22} /></button>} />
      <div><div className="h2">{r.name}</div><div className="body" style={{ marginTop: 4 }}>{r.description ? `${r.description} · ` : ''}{r.exerciseIds.length} ejercicios</div></div>
      <div className="card stack" style={{ gap: 0, padding: '4px 16px' }}>
        {rows?.map((x, i) => (
          <button key={x.id} className="row" style={{ padding: '12px 0', borderTop: i ? '1px solid var(--border)' : 0, textAlign: 'left' }} onClick={() => nav(`/ejercicios/${x.id}`)}>
            <Thumb /><div style={{ flex: 1 }}><div className="title">{x.name}</div><div className="caption" style={{ fontWeight: 400 }}>{x.meta}</div></div>
          </button>
        ))}
      </div>
      <div className="caption" style={{ fontWeight: 400 }}>Las series se rellenan con lo que hiciste la última vez.</div>
      <div className="spacer" />
      <button className="btn btn-primary" onClick={() => guard(async () => { await startRoutine(r); nav('/sesion') })}>Empezar</button>

      {menu === 'menu' && (
        <Sheet onClose={() => setMenu(null)}>
          <div className="title" style={{ fontWeight: 600 }}>{r.name}</div>
          <button className="settings-row" onClick={() => { setNewName(r.name); setMenu('rename') }}><Pencil size={20} /><span className="grow">Cambiar nombre</span></button>
          <button className="settings-row danger" onClick={() => setMenu('delete')}><Trash2 size={20} /><span className="grow">Eliminar rutina</span></button>
          <button className="btn btn-tertiary" onClick={() => setMenu(null)}>Cancelar</button>
        </Sheet>
      )}
      {menu === 'rename' && (
        <Dialog title="Cambiar nombre" onClose={() => setMenu(null)}>
          <input className="input" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
          <button className="btn btn-primary" disabled={!newName.trim()} onClick={async () => { await db.routines.update(r.id, { name: newName.trim(), updatedAt: Date.now() }); setMenu(null) }}>Guardar</button>
        </Dialog>
      )}
      {menu === 'delete' && (
        <Dialog title="¿Eliminar esta rutina?" body={`Se eliminará «${r.name}». Tus sesiones anteriores seguirán en el historial. Esta acción no se puede deshacer.`} onClose={() => setMenu(null)}>
          <button className="btn btn-destructive" onClick={async () => { await db.routines.delete(r.id); nav('/rutinas', { replace: true }) }}>Eliminar</button>
          <button className="btn btn-secondary" onClick={() => setMenu(null)}>Cancelar</button>
        </Dialog>
      )}
      {dialog}
    </Screen>
  )
}

