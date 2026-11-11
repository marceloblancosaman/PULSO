import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Clock, ChevronRight, ChevronLeft, Delete, Plus, X } from 'lucide-react'
import { db, type Session, type SessionEntry, type Unit } from '../db/db'
import { bestWeightKg, discardSession, elapsedMs, fmtDuration, fmtNum, getPrefs, pauseSession, resumeSession, toKg } from '../db/logic'
import { Dialog, Segmented, Sheet, Snack, Thumb } from '../ui'
import posthog from '../posthog'

type Field = 'weight' | 'reps'
type Editing = { set: number; field: Field; buf: string; fresh: boolean }
type Rest = { endsAt: number; total: number }
type SnackState = { title: string; pr?: string; undo: { entries: SessionEntry[]; currentIndex: number } } | null

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
const restKey = (id: string) => `pulso-rest-${id}`

export default function SessionScreen() {
  const nav = useNavigate()
  const session = useLiveQuery(() => db.sessions.where('status').anyOf('active', 'paused').first(), [])
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const exMap = useMemo(() => new Map((exercises ?? []).map(e => [e.id, e])), [exercises])

  const [now, setNow] = useState(Date.now())
  const [editing, setEditing] = useState<Editing | null>(null)
  const [rest, setRest] = useState<Rest | null>(null)
  const [snack, setSnack] = useState<SnackState>(null)
  const [sheet, setSheet] = useState<null | 'pause' | 'discard' | 'saved'>(null)

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  // Al volver a una sesión pausada, se reanuda.
  useEffect(() => { if (session?.status === 'paused') resumeSession(session.id) }, [session?.id, session?.status])

  // El descanso sobrevive a recargar la página.
  useEffect(() => {
    if (!session) return
    try { const r = JSON.parse(sessionStorage.getItem(restKey(session.id)) || 'null'); if (r && r.endsAt > Date.now()) setRest(r) } catch { /* sin descanso guardado */ }
  }, [session?.id])
  useEffect(() => {
    if (!session) return
    try { if (rest) sessionStorage.setItem(restKey(session.id), JSON.stringify(rest)); else sessionStorage.removeItem(restKey(session.id)) } catch { /* almacenamiento no disponible */ }
  }, [rest, session?.id])
  useEffect(() => { if (rest && now >= rest.endsAt) setRest(null) }, [now, rest])

  // Sin ejercicios todavía (rutina nueva): ir a elegir el primero.
  useEffect(() => { if (session && session.entries.length === 0) nav('/ejercicios?modo=sesion', { replace: true }) }, [session, nav])

  if (session === undefined || exercises === undefined) return <div className="screen" />
  if (session === null) { nav('/', { replace: true }); return null }
  if (session.entries.length === 0) return <div className="screen" />

  const s: Session = session
  const idx = Math.min(s.currentIndex, s.entries.length - 1)
  const entry = s.entries[idx]
  const ex = exMap.get(entry.exerciseId)
  const total = s.entries.reduce((a, e) => a + e.sets.length, 0)
  const doneCount = s.entries.reduce((a, e) => a + e.sets.filter(x => x.done).length, 0)
  const next = s.entries[idx + 1]
  const currentSet = entry.sets.findIndex(x => !x.done)

  const save = (entries: SessionEntry[], currentIndex = s.currentIndex) => db.sessions.update(s.id, { entries, currentIndex })
  const updateEntry = (fn: (e: SessionEntry) => void, opts?: { currentIndex?: number }) => {
    const entries = clone(s.entries); fn(entries[idx]); return save(entries, opts?.currentIndex)
  }

  async function complete(setIdx: number, values?: Partial<Record<Field, number | null>>) {
    const before = { entries: clone(s.entries), currentIndex: s.currentIndex }
    const entries = clone(s.entries)
    const e = entries[idx]
    const st = e.sets[setIdx]
    if (values) Object.assign(st, values)
    // Si falta un dato, se abre el teclado en ese campo en vez de registrar una serie incompleta.
    const bodyweight = ex?.equipment === 'Peso corporal'
    if (st.weight === null && !bodyweight) { if (values) await save(entries); setEditing({ set: setIdx, field: 'weight', buf: '', fresh: true }); return }
    if (st.reps === null) { if (values) await save(entries); setEditing({ set: setIdx, field: 'reps', buf: '', fresh: true }); return }
    const wasDone = st.done
    st.done = true; st.doneAt = Date.now()
    // Avance automático en rutinas: al completar la última serie se abre el siguiente ejercicio.
    let currentIndex = s.currentIndex
    if (!wasDone && !s.isNewRoutine && e.sets.every(x => x.done) && idx < entries.length - 1) currentIndex = idx + 1
    await save(entries, currentIndex)
    if (wasDone) return
    posthog.capture('workout_set_completed', {
      workout_type: s.isNewRoutine ? 'new' : 'routine',
      exercise_position: idx + 1,
      set_number: setIdx + 1,
      is_bodyweight: bodyweight,
    })
    const prefs = await getPrefs()
    setRest({ endsAt: Date.now() + prefs.restSeconds * 1000, total: prefs.restSeconds })
    let pr: string | undefined
    if (st.weight) {
      const best = await bestWeightKg(e.exerciseId, s.id)
      const doneHere = e.sets.filter((x, i) => x.done && i !== setIdx && x.weight).map(x => toKg(x.weight!, e.unit))
      const kg = toKg(st.weight, e.unit)
      if (best > 0 && kg > best && kg > Math.max(0, ...doneHere)) pr = `Nueva marca: ${fmtNum(st.weight)} ${e.unit} × ${st.reps ?? '—'}`
    }
    setSnack({ title: `Serie ${setIdx + 1} registrada`, pr, undo: before })
  }

  async function uncomplete(setIdx: number) {
    await updateEntry(e => { e.sets[setIdx].done = false; delete e.sets[setIdx].doneAt })
  }

  async function undo() {
    if (!snack) return
    await save(snack.undo.entries, snack.undo.currentIndex)
    setRest(null); setSnack(null)
  }

  function openKeypad(setIdx: number, field: Field) {
    setEditing({ set: setIdx, field, buf: '', fresh: true })
  }

  function press(k: string) {
    if (!editing) return
    setEditing(ed => {
      if (!ed) return ed
      let buf = ed.fresh ? '' : ed.buf
      if (k === 'del') buf = buf.slice(0, -1)
      else if (k === ',') { if (ed.field === 'reps' || buf.includes(',')) return ed; buf = (buf || '0') + ',' }
      else { if (buf.replace(',', '').length >= 5) return ed; buf = buf === '0' ? k : buf + k }
      return { ...ed, buf, fresh: false }
    })
  }

  async function confirmKeypad() {
    if (!editing) return
    const st = entry.sets[editing.set]
    const typed = editing.fresh ? null : editing.buf
    const value = typed === null ? st[editing.field] : (typed === '' ? null : parseFloat(typed.replace(',', '.')))
    const values = { ...st, [editing.field]: value }
    setEditing(null)
    if (st.done) { await updateEntry(e => { e.sets[editing.set][editing.field] = value }); return }
    // Si falta el otro dato, se pasa a él antes de registrar.
    const other: Field = editing.field === 'weight' ? 'reps' : 'weight'
    if (values[other] === null && !(other === 'weight' && ex?.equipment === 'Peso corporal')) {
      await updateEntry(e => { e.sets[editing.set][editing.field] = value })
      setEditing({ set: editing.set, field: other, buf: '', fresh: true })
      return
    }
    await complete(editing.set, { [editing.field]: value })
  }

  const addSet = () => updateEntry(e => { const last = e.sets[e.sets.length - 1]; e.sets.push({ weight: last?.weight ?? null, reps: last?.reps ?? null, done: false }) })
  const removeLastSet = () => updateEntry(e => { if (e.sets.length > 1 && !e.sets[e.sets.length - 1].done) e.sets.pop() })
  const setUnit = (u: Unit) => updateEntry(e => { e.unit = u })
  const goTo = (i: number) => save(s.entries, i)

  const prevText = (i: number) => { const p = entry.previous[i]; return p ? `${fmtNum(p.weight) || '—'}${p.weight !== null ? ` ${entry.unit}` : ''} × ${p.reps ?? '—'}` : '—' }
  const shown = (i: number, f: Field) => {
    if (editing && editing.set === i && editing.field === f) return editing.fresh ? fmtNum(entry.sets[i][f]) : editing.buf
    return fmtNum(entry.sets[i][f])
  }
  const restLeft = rest ? Math.max(0, rest.endsAt - now) : 0
  const entryHasDone = entry.sets.some(x => x.done)

  return (
    <div className="screen" style={{ paddingBottom: editing ? 360 : undefined }}>
      <div className="content tight">
        {/* Barra superior */}
        <div className="row">
          <button className="icon-btn" aria-label="Pausar o salir" onClick={() => setSheet('pause')}><X size={22} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            <div className="caption">{s.isNewRoutine ? `Ejercicio ${idx + 1} · rutina nueva` : `Ejercicio ${idx + 1} de ${s.entries.length}`}</div>
          </div>
          <div className="timer-pill"><Clock size={16} />{fmtDuration(elapsedMs(s, now))}</div>
        </div>

        {!s.isNewRoutine && (
          <div className="stack" style={{ gap: 8 }}>
            <div className="progress"><div style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} /></div>
            <div className="caption">{doneCount} de {total} series completadas</div>
          </div>
        )}

        {rest && (
          <div className="rest">
            <div><div className="overline">Descanso</div><div className="time">{fmtDuration(restLeft)}</div></div>
            <div className="track"><div style={{ width: `${(restLeft / (rest.total * 1000)) * 100}%` }} /></div>
            <button className="pill pill-outline" onClick={() => setRest(r => r && { endsAt: r.endsAt + 30000, total: r.total + 30 })}>+30 s</button>
            <button className="pill pill-solid" onClick={() => setRest(null)}>Saltar</button>
          </div>
        )}

        {/* Ejercicio actual */}
        <div className="row">
          <button onClick={() => nav(`/ejercicios/${entry.exerciseId}`)} aria-label="Ver ejercicio"><Thumb lg /></button>
          <div className="h3" style={{ flex: 1, minWidth: 0 }}>{ex?.name ?? 'Ejercicio'}</div>
          <Segmented value={entry.unit} onChange={setUnit} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
        </div>

        <div className="cols"><span className="c-n">#</span><span className="c-prev">Anterior</span><span className="c-v">{entry.unit === 'kg' ? 'Kg' : 'Lb'}</span><span className="c-v">Reps</span><span className="c-ck" /></div>
        <div className="sets">
          {entry.sets.map((st, i) => {
            const focus = (f: Field) => editing?.set === i && editing.field === f
            return (
              <div key={i} className={`set-row ${st.done ? 'done' : ''} ${i === currentSet && !editing ? 'current' : ''} ${editing?.set === i ? 'current' : ''}`}>
                <span className="n">{i + 1}</span>
                <span className="prev">{prevText(i)}</span>
                <button className={`val ${focus('weight') ? 'focus' : ''} ${st.weight === null && !focus('weight') ? 'empty' : ''}`} onClick={() => openKeypad(i, 'weight')} aria-label={`Peso de la serie ${i + 1}`}>{shown(i, 'weight') || '—'}</button>
                <button className={`val ${focus('reps') ? 'focus' : ''} ${st.reps === null && !focus('reps') ? 'empty' : ''}`} onClick={() => openKeypad(i, 'reps')} aria-label={`Repeticiones de la serie ${i + 1}`}>{shown(i, 'reps') || '—'}</button>
                <button className={`check ${st.done ? 'on' : ''}`} aria-label={st.done ? 'Desmarcar serie' : 'Registrar serie'} onClick={() => (st.done ? uncomplete(i) : complete(i))}><Check size={15} strokeWidth={3} /></button>
              </div>
            )
          })}
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="link" onClick={addSet}>+ Añadir serie</button>
          {entry.sets.length > 1 && !entry.sets[entry.sets.length - 1].done && <button className="link muted" style={{ fontWeight: 500, fontSize: 14 }} onClick={removeLastSet}>Quitar serie</button>}
        </div>

        {/* Navegación entre ejercicios */}
        {!s.isNewRoutine && next && (
          <button className="list-card" style={{ minHeight: 64 }} onClick={() => goTo(idx + 1)}>
            <div className="grow"><div className="overline">Siguiente</div><div className="name" style={{ fontSize: 15 }}>{exMap.get(next.exerciseId)?.name}</div><div className="meta" style={{ fontSize: 12 }}>{next.sets.length} {next.sets.length === 1 ? 'serie' : 'series'}</div></div>
            <ChevronRight size={20} className="muted" />
          </button>
        )}
        {(idx > 0 || !s.isNewRoutine) && (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            {idx > 0 ? <button className="link muted" style={{ fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => goTo(idx - 1)}><ChevronLeft size={16} />Ejercicio anterior</button> : <span />}
            {!s.isNewRoutine && <button className="link" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => nav('/ejercicios?modo=sesion')}><Plus size={16} />Añadir ejercicio</button>}
          </div>
        )}

        <div className="spacer" />
        {s.isNewRoutine
          ? <button className="btn btn-primary" disabled={!entryHasDone} onClick={() => setSheet('saved')}>Guardar ejercicio</button>
          : <button className="btn btn-secondary" onClick={() => nav('/sesion/terminar')}>Finalizar entrenamiento</button>}
        {s.isNewRoutine && !entryHasDone && <div className="caption" style={{ textAlign: 'center' }}>Registra al menos una serie para guardarlo.</div>}
      </div>

      {/* Teclado numérico */}
      {editing && (<>
        <div style={{ position: 'fixed', inset: 0, zIndex: 34 }} onClick={() => setEditing(null)} />
        <div className="keypad">
          <div className="bar">
            <div className="grow"><div className="title" style={{ fontWeight: 600 }}>Serie {editing.set + 1} · {editing.field === 'weight' ? `Peso (${entry.unit})` : 'Repeticiones'}</div></div>
            <button className="ok" aria-label="Confirmar" onClick={confirmKeypad}><Check size={24} strokeWidth={3} /></button>
          </div>
          <div className="keys">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'].map(k => (
              <button key={k} className="key" onClick={() => press(k)} aria-label={k === 'del' ? 'Borrar' : k} style={k === ',' && editing.field === 'reps' ? { opacity: 0.3 } : undefined}>
                {k === 'del' ? <Delete size={24} /> : k}
              </button>
            ))}
          </div>
        </div>
      </>)}

      {snack && !editing && (
        <Snack raised action="Deshacer" onAction={undo} onTimeout={() => setSnack(null)} ms={5000}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{snack.title}</div>
          {snack.pr && <div className="brand" style={{ fontSize: 12, marginTop: 2 }}>{snack.pr}</div>}
        </Snack>
      )}

      {sheet === 'pause' && (
        <Sheet onClose={() => setSheet(null)}>
          <div className="h3">¿Pausar o salir del entrenamiento?</div>
          <button className="btn btn-primary" onClick={() => setSheet(null)}>Continuar entrenando</button>
          <button className="btn btn-secondary" onClick={async () => { await pauseSession(s.id); posthog.capture('workout_paused', { completed_set_count: doneCount }); nav('/') }}>Guardar y salir</button>
          <div className="caption">Conservas tus {doneCount} series para continuar más tarde desde Inicio.</div>
          <button className="btn btn-tertiary" style={{ color: 'var(--error)' }} onClick={() => setSheet('discard')}>Descartar entrenamiento</button>
        </Sheet>
      )}
      {sheet === 'discard' && (
        <Dialog title="¿Descartar la sesión?" body={`Se eliminarán las ${doneCount} series registradas. Esta acción no se puede deshacer.`} onClose={() => setSheet(null)}>
          <button className="btn btn-destructive" onClick={async () => { await discardSession(s.id); posthog.capture('workout_discarded', { completed_set_count: doneCount }); nav('/') }}>Descartar</button>
          <button className="btn btn-secondary" onClick={() => setSheet(null)}>Volver</button>
        </Dialog>
      )}
      {sheet === 'saved' && (
        <Sheet onClose={() => setSheet(null)}>
          <div className="row">
            <div className="empty-ic" style={{ width: 44, height: 44, boxShadow: 'none' }}><Check size={22} /></div>
            <div><div className="h3" style={{ fontSize: 18 }}>{ex?.name} guardado</div><div className="label" style={{ fontWeight: 400 }}>{entry.sets.filter(x => x.done).length} series · añadido a «{s.name}»</div></div>
          </div>
          <button className="btn btn-primary" onClick={() => { setSheet(null); nav('/ejercicios?modo=sesion') }}>Añadir otro ejercicio</button>
          <button className="btn btn-secondary" onClick={() => { setSheet(null); nav('/sesion/terminar') }}>Terminar entrenamiento</button>
        </Sheet>
      )}
    </div>
  )
}
