import { db, uid, type Exercise, type Session, type SessionEntry, type Unit, type Routine } from './db'
import { CATALOG } from './catalog'

/* ---------- Arranque ---------- */
export async function ensureSeed() {
  // Se vuelve a escribir en cada inicio para que las mejoras del catálogo lleguen a todos.
  await db.exercises.bulkPut(CATALOG)
}

/* ---------- Preferencias ---------- */
export type Prefs = { name: string; unit: Unit; restSeconds: number; installDismissed: boolean; deviceId?: string }
export const DEFAULT_PREFS: Prefs = { name: '', unit: 'kg', restSeconds: 90, installDismissed: false }

export async function getPrefs(): Promise<Prefs> {
  const rows = await db.prefs.toArray()
  const p = { ...DEFAULT_PREFS }
  for (const r of rows) (p as Record<string, unknown>)[r.key] = r.value
  return p
}
export async function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  await db.prefs.put({ key, value })
}

/* ---------- Utilidades ---------- */
export const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export function searchExercises(list: Exercise[], q: string) {
  const n = normalize(q)
  if (!n) return list
  const words = n.split(/\s+/)
  return list.filter(e => {
    const hay = normalize([e.name, ...e.aliases, e.muscle, e.equipment].join(' '))
    return words.every(w => hay.includes(w))
  })
}

export const LB_TO_KG = 0.45359237
export const toKg = (w: number, u: Unit) => (u === 'lb' ? w * LB_TO_KG : w)

export function fmtNum(n: number | null | undefined) {
  if (n === null || n === undefined) return ''
  const r = Math.round(n * 100) / 100
  return String(r).replace('.', ',')
}
export function fmtDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}
export function fmtDate(t: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const s = new Date(t).toLocaleDateString('es-PE', opts).replace('.', '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}
export function defaultWorkoutName() {
  return 'Entrenamiento ' + new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '')
}

/* ---------- Historial ---------- */
async function doneSessionsDesc() {
  const all = await db.sessions.where('status').equals('done').toArray()
  return all.sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))
}

/** Lo que se hizo la última vez en este ejercicio (solo series completadas). */
export async function lastPerformance(exerciseId: string, excludeSessionId?: string) {
  for (const s of await doneSessionsDesc()) {
    if (s.id === excludeSessionId) continue
    const e = s.entries.find(x => x.exerciseId === exerciseId)
    const done = e?.sets.filter(x => x.done) ?? []
    if (e && done.length) return { unit: e.unit, sets: done.map(x => ({ weight: x.weight, reps: x.reps })), sessionId: s.id }
  }
  return null
}

/** Mejor peso histórico (en kg) para detectar una nueva marca. */
export async function bestWeightKg(exerciseId: string, excludeSessionId?: string) {
  let best = 0
  for (const s of await doneSessionsDesc()) {
    if (s.id === excludeSessionId) continue
    for (const e of s.entries) if (e.exerciseId === exerciseId)
      for (const st of e.sets) if (st.done && st.weight) best = Math.max(best, toKg(st.weight, e.unit))
  }
  return best
}

/* ---------- Sesiones ---------- */
export async function buildEntry(exerciseId: string): Promise<SessionEntry> {
  const [ex, prefs, last] = await Promise.all([db.exercises.get(exerciseId), getPrefs(), lastPerformance(exerciseId)])
  const unit: Unit = last?.unit ?? ex?.defaultUnit ?? prefs.unit
  // Se rellena con lo que hiciste la última vez; si es la primera vez, una serie vacía.
  const sets = last ? last.sets.map(s => ({ ...s, done: false })) : [{ weight: null, reps: null, done: false }]
  return { exerciseId, unit, sets, previous: last?.sets ?? [] }
}

export async function startSession(opts: { routine?: Routine; name: string; description?: string }) {
  const entries = opts.routine ? await Promise.all(opts.routine.exerciseIds.map(buildEntry)) : []
  const now = Date.now()
  const s: Session = {
    id: uid(), routineId: opts.routine?.id ?? null, isNewRoutine: !opts.routine,
    name: opts.name, description: opts.description, status: 'active',
    startedAt: now, activeMs: 0, resumedAt: now, entries, currentIndex: 0,
  }
  // Solo una sesión abierta a la vez: las anteriores sin terminar se descartan.
  await db.sessions.where('status').anyOf('active', 'paused').delete()
  await db.sessions.put(s)
  return s
}

export async function addExerciseToSession(sessionId: string, exerciseId: string) {
  const s = await db.sessions.get(sessionId)
  if (!s) return
  const existing = s.entries.findIndex(e => e.exerciseId === exerciseId)
  if (existing >= 0) { s.currentIndex = existing } else {
    s.entries.push(await buildEntry(exerciseId))
    s.currentIndex = s.entries.length - 1
  }
  await db.sessions.put(s)
}

export const elapsedMs = (s: Session, now = Date.now()) => s.activeMs + (s.status === 'active' ? now - s.resumedAt : 0)

export async function pauseSession(id: string) {
  const s = await db.sessions.get(id); if (!s || s.status !== 'active') return
  await db.sessions.update(id, { status: 'paused', activeMs: elapsedMs(s) })
}
export async function resumeSession(id: string) {
  const s = await db.sessions.get(id); if (!s || s.status !== 'paused') return
  await db.sessions.update(id, { status: 'active', resumedAt: Date.now() })
}
export const discardSession = (id: string) => db.sessions.delete(id)

export function sessionStats(s: Session) {
  let sets = 0, total = 0, volumeKg = 0, exercises = 0
  for (const e of s.entries) {
    const done = e.sets.filter(x => x.done)
    total += e.sets.length; sets += done.length
    if (done.length) exercises++
    for (const x of done) volumeKg += toKg(x.weight ?? 0, e.unit) * (x.reps ?? 0)
  }
  return { sets, total, exercises, volumeKg: Math.round(volumeKg), duration: elapsedMs(s, s.endedAt ?? Date.now()) }
}

/** Guarda la sesión; si la rutina es nueva, la crea; si no, añade los ejercicios nuevos. */
export async function finishSession(id: string, patch: { name?: string; notes?: string }) {
  const s = await db.sessions.get(id); if (!s) return null
  const now = Date.now()
  const usedIds = s.entries.filter(e => e.sets.some(x => x.done)).map(e => e.exerciseId)
  const name = (patch.name ?? s.name).trim() || s.name
  let routineId = s.routineId
  await db.transaction('rw', db.sessions, db.routines, async () => {
    if (s.isNewRoutine || !routineId) {
      routineId = uid()
      await db.routines.put({ id: routineId, name, description: s.description, exerciseIds: usedIds, createdAt: now, updatedAt: now, lastUsedAt: now })
    } else {
      const r = await db.routines.get(routineId)
      if (r) {
        const ids = [...r.exerciseIds]
        for (const x of usedIds) if (!ids.includes(x)) ids.push(x)
        await db.routines.update(routineId, { exerciseIds: ids, lastUsedAt: now, updatedAt: ids.length !== r.exerciseIds.length ? now : r.updatedAt })
      }
    }
    // Las series no marcadas no se guardan en el historial.
    const entries = s.entries.map(e => ({ ...e, sets: e.sets.filter(x => x.done) })).filter(e => e.sets.length)
    await db.sessions.update(id, { status: 'done', endedAt: now, activeMs: elapsedMs(s, now), name, notes: patch.notes, routineId, entries })
  })
  return routineId
}

/** Sesión anterior de la misma rutina, para comparar al terminar. */
export async function previousOfRoutine(routineId: string, beforeId: string) {
  return (await doneSessionsDesc()).find(x => x.routineId === routineId && x.id !== beforeId) ?? null
}

export async function createCustomExercise(e: Omit<Exercise, 'id' | 'aliases' | 'custom'>) {
  const ex: Exercise = { ...e, id: 'custom-' + uid(), aliases: [], custom: true, createdAt: Date.now() }
  await db.exercises.put(ex)
  return ex
}
