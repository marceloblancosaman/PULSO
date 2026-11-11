import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChartLine, ChevronRight, History as HistoryIcon, Trash2 } from 'lucide-react'
import { db, type Session } from '../db/db'
import { fmtDate, fmtDuration, fmtNum, sessionStats, toKg } from '../db/logic'
import { Dialog, EmptyState, Header, Screen, Segmented } from '../ui'

const doneDesc = async () => (await db.sessions.where('status').equals('done').toArray()).sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))

/* 37 · Historial */
export function HistoryList() {
  const nav = useNavigate()
  const sessions = useLiveQuery(doneDesc, [])
  return (
    <Screen>
      <Header title="Historial" />
      <div className="body">Tus sesiones registradas, de la más reciente a la más antigua.</div>
      {sessions && sessions.length === 0 && (
        <EmptyState icon={<HistoryIcon size={30} />} title="Aún no hay entrenamientos" body="Cuando termines tu primera sesión aparecerá aquí.">
          <button className="btn btn-primary" onClick={() => nav('/nuevo')}>Empezar entrenamiento</button>
        </EmptyState>
      )}
      {sessions?.map(s => { const st = sessionStats(s); return (
        <button key={s.id} className="list-card" onClick={() => nav(`/historial/${s.id}`)}>
          <div className="grow"><div className="name">{s.name}</div><div className="meta">{fmtDate(s.endedAt!)} · {fmtDuration(st.duration)} · {st.exercises} ejercicios</div></div>
          <ChevronRight size={20} className="muted" />
        </button>
      ) })}
    </Screen>
  )
}

/* 38 · Detalle de sesión */
export function SessionDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useLiveQuery(() => db.sessions.get(id!), [id])
  const exs = useLiveQuery(() => db.exercises.toArray(), [])
  const routine = useLiveQuery(async () => (s?.routineId ? db.routines.get(s.routineId) : undefined), [s])
  const [del, setDel] = useState(false)
  if (!s || !exs) return <Screen><Header /></Screen>
  const name = (eid: string) => exs.find(e => e.id === eid)?.name ?? 'Ejercicio'
  const st = sessionStats(s)
  return (
    <Screen>
      <Header title="Sesión" right={<button className="icon-btn" aria-label="Eliminar sesión" onClick={() => setDel(true)}><Trash2 size={20} /></button>} />
      <div><div className="h3">{s.name}</div><div className="body" style={{ marginTop: 4 }}>{fmtDate(s.endedAt!, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmtDuration(st.duration)} · {fmtNum(st.volumeKg)} kg de volumen</div></div>
      {s.entries.map(e => (
        <div key={e.exerciseId} className="card stack" style={{ gap: 8 }}>
          <button className="title" style={{ fontWeight: 600, textAlign: 'left' }} onClick={() => nav(`/progreso/${e.exerciseId}`)}>{name(e.exerciseId)}</button>
          {e.sets.map((x, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
              <span className="label">Serie {i + 1}</span>
              <span className="title" style={{ fontVariantNumeric: 'tabular-nums' }}>{x.weight !== null ? `${fmtNum(x.weight)} ${e.unit}` : 'Peso corporal'} × {x.reps ?? '—'}</span>
            </div>
          ))}
        </div>
      ))}
      {s.notes && <div className="card"><div className="overline">Notas</div><div className="body" style={{ marginTop: 6, color: 'var(--text-primary)' }}>{s.notes}</div></div>}
      <div className="spacer" />
      {routine && <button className="btn btn-primary" onClick={() => nav(`/rutinas/${routine.id}`)}>Repetir rutina</button>}
      {del && (
        <Dialog title="¿Eliminar esta sesión?" body="Se borrará del historial y de tu progreso. Esta acción no se puede deshacer." onClose={() => setDel(false)}>
          <button className="btn btn-destructive" onClick={async () => { await db.sessions.delete(s.id); nav(-1) }}>Eliminar</button>
          <button className="btn btn-secondary" onClick={() => setDel(false)}>Cancelar</button>
        </Dialog>
      )}
    </Screen>
  )
}

/* 39 · Progreso */
export function Progress() {
  const nav = useNavigate()
  const sessions = useLiveQuery(doneDesc, [])
  const exs = useLiveQuery(() => db.exercises.toArray(), [])
  const weeks = useMemo(() => {
    const start = new Date(); const day = (start.getDay() + 6) % 7; start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - day)
    return Array.from({ length: 6 }, (_, i) => {
      const from = start.getTime() - (5 - i) * 7 * 86400000, to = from + 7 * 86400000
      return { label: new Date(from).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', ''), n: (sessions ?? []).filter(s => (s.endedAt ?? 0) >= from && (s.endedAt ?? 0) < to).length }
    })
  }, [sessions])
  const byExercise = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of sessions ?? []) for (const e of s.entries) m.set(e.exerciseId, (m.get(e.exerciseId) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [sessions])
  if (!sessions || !exs) return <Screen nav>{null}</Screen>
  const max = Math.max(1, ...weeks.map(w => w.n))
  const totalWeeks = weeks.reduce((a, w) => a + w.n, 0)
  return (
    <Screen nav>
      <div className="row" style={{ justifyContent: 'space-between' }}><div className="h1">Progreso</div><button className="link" style={{ fontSize: 14 }} onClick={() => nav('/historial')}>Historial</button></div>
      {sessions.length === 0 ? (
        <EmptyState icon={<ChartLine size={30} />} title="Tu progreso aparecerá aquí" body="Cuando registres tu primer entrenamiento verás aquí tus gráficas.">
          <button className="btn btn-primary" onClick={() => nav('/nuevo')}>Empezar entrenamiento</button>
        </EmptyState>
      ) : (<>
        <div className="card stack" style={{ gap: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="title" style={{ fontWeight: 600 }}>Entrenamientos por semana</div>
            <div style={{ textAlign: 'right' }}><div className="h2 brand">{totalWeeks}</div><div className="caption">en 6 semanas</div></div>
          </div>
          <div className="bars">
            {weeks.map((w, i) => (
              <div key={i} className="b">
                <span className="caption">{w.n}</span>
                <div className={`fill ${w.n ? '' : 'zero'}`} style={{ height: `${(w.n / max) * 100}%` }} />
                <span className="caption" style={{ fontWeight: 400, whiteSpace: 'nowrap' }}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="title" style={{ fontWeight: 600 }}>Evolución de ejercicios</div>
        {byExercise.map(([id, n]) => (
          <button key={id} className="list-card" onClick={() => nav(`/progreso/${id}`)}>
            <div className="grow"><div className="name">{exs.find(e => e.id === id)?.name ?? 'Ejercicio'}</div><div className="meta">{n} {n === 1 ? 'sesión registrada' : 'sesiones registradas'}{n < 3 ? ' · registra 3 para ver su evolución' : ''}</div></div>
            <ChevronRight size={20} className="muted" />
          </button>
        ))}
      </>)}
    </Screen>
  )
}

/* 40 · Progreso de un ejercicio */
export function ExerciseProgress() {
  const { id } = useParams()
  const ex = useLiveQuery(() => db.exercises.get(id!), [id])
  const sessions = useLiveQuery(doneDesc, [])
  const [metric, setMetric] = useState<'peso' | 'volumen'>('peso')
  if (!ex || !sessions) return <Screen><Header /></Screen>
  const rows = sessions.flatMap(s => { const e = s.entries.find(x => x.exerciseId === id); return e ? [{ s, e }] : [] }) as { s: Session; e: Session['entries'][number] }[]
  const points = rows.slice(0, 8).reverse().map(({ s, e }) => ({
    label: new Date(s.endedAt!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', ''),
    value: metric === 'peso' ? Math.max(0, ...e.sets.map(x => x.weight ?? 0)) : Math.round(e.sets.reduce((a, x) => a + toKg(x.weight ?? 0, e.unit) * (x.reps ?? 0), 0)),
    unit: metric === 'peso' ? e.unit : 'kg',
  }))
  const max = Math.max(1, ...points.map(p => p.value))
  return (
    <Screen>
      <Header title={ex.name} />
      <div className="body">{ex.muscle} · {ex.equipment} · {rows.length} {rows.length === 1 ? 'sesión registrada' : 'sesiones registradas'}</div>
      <Segmented surface value={metric} onChange={setMetric} options={[{ value: 'peso', label: 'Peso máximo' }, { value: 'volumen', label: 'Volumen' }]} />
      {rows.length < 3 && <div className="card-brand body" style={{ color: 'var(--text-primary)' }}>Registra al menos 3 sesiones de este ejercicio para ver su evolución con claridad.</div>}
      {points.length > 0 && (
        <div className="card stack" style={{ gap: 12 }}>
          <div className="title" style={{ fontWeight: 600 }}>{metric === 'peso' ? 'Peso máximo por sesión' : 'Volumen por sesión (kg)'}</div>
          <div className="bars">
            {points.map((p, i) => (
              <div key={i} className="b"><span className="caption">{fmtNum(p.value)}</span><div className="fill" style={{ height: `${(p.value / max) * 100}%` }} /><span className="caption" style={{ fontWeight: 400, whiteSpace: 'nowrap' }}>{p.label}</span></div>
            ))}
          </div>
        </div>
      )}
      <div className="card stack" style={{ gap: 10 }}>
        <div className="row caption"><span style={{ width: 64 }}>FECHA</span><span style={{ width: 72 }}>PESO</span><span>REPETICIONES</span></div>
        {rows.map(({ s, e }) => (
          <div key={s.id} className="row label" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
            <span style={{ width: 64 }}>{new Date(s.endedAt!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '')}</span>
            <span style={{ width: 72 }}>{fmtNum(Math.max(0, ...e.sets.map(x => x.weight ?? 0))) || '—'} {e.unit}</span>
            <span>{e.sets.map(x => x.reps ?? '—').join(' · ')}</span>
          </div>
        ))}
      </div>
      <div className="caption" style={{ fontWeight: 400 }}>Un peso mayor no siempre indica una mejora: compara también las repeticiones.</div>
    </Screen>
  )
}
