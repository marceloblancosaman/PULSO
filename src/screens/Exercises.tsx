import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ChevronRight, Plus, Search, SearchX } from 'lucide-react'
import { db, type Equipment, type Muscle, type Unit } from '../db/db'
import { MUSCLES, EQUIPMENT } from '../db/catalog'
import { addExerciseToSession, createCustomExercise, getPrefs, searchExercises } from '../db/logic'
import { EmptyState, Header, Screen, Segmented, Thumb } from '../ui'
import { track } from '../analytics'

const openSession = () => db.sessions.where('status').anyOf('active', 'paused').first()

/* N2 · Elegir ejercicio (o explorar el catálogo) */
export function ExercisePicker() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const forSession = params.get('modo') === 'sesion'
  const all = useLiveQuery(() => db.exercises.toArray(), [])
  const session = useLiveQuery(openSession, [])
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState<Muscle | 'Todos' | 'Propios'>('Todos')

  const list = useMemo(() => {
    let l = all ?? []
    if (muscle === 'Propios') l = l.filter(e => e.custom)
    else if (muscle !== 'Todos') l = l.filter(e => e.muscle === muscle)
    return searchExercises(l, q).sort((a, b) => Number(!!b.custom) - Number(!!a.custom) || a.name.localeCompare(b.name, 'es'))
  }, [all, q, muscle])
  const inSession = new Set(session?.entries.map(e => e.exerciseId) ?? [])
  const hasCustom = (all ?? []).some(e => e.custom)

  useEffect(() => { if (q.trim().length >= 3 && list.length === 0) { const t = setTimeout(() => track('search_no_results', { query: q.trim() }), 1200); return () => clearTimeout(t) } }, [q, list.length])

  async function pick(id: string) {
    if (forSession && session) {
      track('exercise_added', { source: 'catalog', used_search: !!q.trim(), filter: muscle, custom: !!all?.find(e => e.id === id)?.custom })
      await addExerciseToSession(session.id, id); nav('/sesion', { replace: true }) }
    else nav(`/ejercicios/${id}`)
  }
  const createHref = `/ejercicios/nuevo?${forSession ? 'modo=sesion&' : ''}nombre=${encodeURIComponent(q)}`

  return (
    <Screen>
      <Header title={forSession ? 'Elige un ejercicio' : 'Ejercicios'} />
      <div className="search"><Search size={20} /><input className="input" placeholder="Buscar ejercicio" value={q} onChange={e => setQ(e.target.value)} autoFocus={forSession} /></div>
      <div className="chips">
        {(['Todos', ...(hasCustom ? ['Propios'] : []), ...MUSCLES] as const).map(m => (
          <button key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m as typeof muscle)}>{muscle === m && <Check size={16} />}{m}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<SearchX size={30} />} title={q ? `Sin resultados para «${q}»` : 'Sin ejercicios'} body="Revisa la ortografía o prueba con otro filtro.">
          <button className="btn btn-primary" onClick={() => nav(createHref)}>{q ? `Crear «${q}» como ejercicio` : 'Crear ejercicio'}</button>
          <button className="btn btn-tertiary" onClick={() => { setQ(''); setMuscle('Todos') }}>Borrar filtros</button>
        </EmptyState>
      ) : (<>
        <button className="list-card dashed" style={{ minHeight: 60 }} onClick={() => nav(createHref)}>
          <Plus size={22} className="brand" />
          <div className="grow"><div className="name" style={{ fontSize: 15 }}>¿No está en el catálogo?</div><div className="meta brand">Crea un ejercicio propio</div></div>
        </button>
        <div className="stack" style={{ gap: 8 }}>
          {list.map(e => (
            <button key={e.id} className="list-card" onClick={() => pick(e.id)}>
              <Thumb />
              <div className="grow"><div className="name">{e.name}</div><div className="meta">{e.muscle} · {e.equipment}{e.custom ? ' · Propio' : ''}</div></div>
              {forSession ? (inSession.has(e.id) ? <span className="badge">En la sesión</span> : <span className="icon-btn" style={{ width: 36, height: 36 }}><Plus size={18} /></span>) : <ChevronRight size={20} className="muted" />}
            </button>
          ))}
        </div>
      </>)}
    </Screen>
  )
}

/* 21 · Detalle de ejercicio */
export function ExerciseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const ex = useLiveQuery(() => db.exercises.get(id!), [id])
  const alts = useLiveQuery(async () => (ex?.alternatives ? (await db.exercises.bulkGet(ex.alternatives)).filter(Boolean) : []), [ex])
  const session = useLiveQuery(openSession, [])
  if (!ex) return <Screen><Header /></Screen>
  const inSession = session?.entries.some(e => e.exerciseId === ex.id)
  return (
    <Screen>
      <Header title="Ejercicio" />
      <div className="card-brand" style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Thumb lg /></div>
      <div className="h2">{ex.name}</div>
      <div className="chips wrap"><span className="chip">{ex.muscle}</span><span className="chip">{ex.equipment}</span>{ex.custom && <span className="chip on">Propio</span>}</div>
      {ex.aliases.length > 0 && <div><div className="label">También se conoce como</div><div className="body" style={{ marginTop: 4 }}>{ex.aliases.join(', ')}</div></div>}
      {alts && alts.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="label">¿Equipo ocupado? Prueba con</div>
          <div className="chips wrap">{alts.map(a => a && <button key={a.id} className="chip" onClick={() => nav(`/ejercicios/${a.id}`, { replace: true })}>{a.name}</button>)}</div>
        </div>
      )}
      <div className="spacer" />
      {session && !inSession && <button className="btn btn-primary" onClick={async () => { await addExerciseToSession(session.id, ex.id); nav('/sesion') }}>Añadir al entrenamiento</button>}
      {session && inSession && <button className="btn btn-secondary" onClick={() => nav('/sesion')}>Volver al entrenamiento</button>}
    </Screen>
  )
}

/* 20c · Crear ejercicio propio */
export function CreateExercise() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const forSession = params.get('modo') === 'sesion'
  const [name, setName] = useState(params.get('nombre') ?? '')
  const [muscle, setMuscle] = useState<Muscle | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [unit, setUnit] = useState<Unit | null>(null)
  const prefs = useLiveQuery(getPrefs, [])
  const u = unit ?? prefs?.unit ?? 'kg'
  const valid = name.trim().length >= 2 && muscle && equipment

  async function saveIt() {
    if (!valid) return
    const ex = await createCustomExercise({ name: name.trim(), muscle: muscle!, equipment: equipment!, defaultUnit: u })
    track('custom_exercise_created', { name: ex.name, muscle: ex.muscle, equipment: ex.equipment, unit: u, during_session: forSession })
    const s = await openSession()
    if (forSession && s) { await addExerciseToSession(s.id, ex.id); nav('/sesion', { replace: true }) }
    else nav(`/ejercicios/${ex.id}`, { replace: true })
  }

  return (
    <Screen>
      <Header title="Crear ejercicio" />
      <div className="field">
        <label htmlFor="n">Nombre del ejercicio</label>
        <input id="n" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej.: Prensa de piernas 45°" autoFocus />
        <span className="helper">Así aparecerá en tus rutinas y en tu historial.</span>
      </div>
      <div className="field"><label>Grupo muscular</label>
        <div className="chips wrap">{MUSCLES.map(m => <button key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>{muscle === m && <Check size={16} />}{m}</button>)}</div>
      </div>
      <div className="field"><label>Equipo</label>
        <div className="chips wrap">{EQUIPMENT.map(m => <button key={m} className={`chip ${equipment === m ? 'on' : ''}`} onClick={() => setEquipment(m)}>{equipment === m && <Check size={16} />}{m}</button>)}</div>
      </div>
      <div className="row">
        <div style={{ flex: 1 }}><div className="title">Unidad de esta máquina</div><div className="caption" style={{ fontWeight: 400 }}>Podrás cambiarla al entrenar</div></div>
        <Segmented surface value={u} onChange={setUnit} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
      </div>
      <div className="spacer" />
      <div className="caption" style={{ fontWeight: 400 }}>Solo tú verás este ejercicio. Lo encontrarás en la biblioteca con la etiqueta «Propio».</div>
      <button className="btn btn-primary" disabled={!valid} onClick={saveIt}>{forSession ? 'Guardar y entrenarlo' : 'Guardar ejercicio'}</button>
      <button className="btn btn-tertiary" onClick={() => nav(-1)}>Cancelar</button>
    </Screen>
  )
}
