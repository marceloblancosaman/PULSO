import Dexie, { type Table } from 'dexie'

export type Unit = 'kg' | 'lb'
export type Muscle = 'Pecho' | 'Espalda' | 'Piernas' | 'Glúteos' | 'Hombros' | 'Brazos' | 'Core'
export type Equipment = 'Barra' | 'Mancuernas' | 'Máquina' | 'Polea' | 'Peso corporal' | 'Smith' | 'Otro'

export interface Exercise {
  id: string
  name: string
  aliases: string[]
  muscle: Muscle
  equipment: Equipment
  defaultUnit?: Unit
  custom?: boolean
  alternatives?: string[]
  createdAt?: number
}

export interface Routine {
  id: string
  name: string
  description?: string
  exerciseIds: string[]
  createdAt: number
  updatedAt: number
  lastUsedAt?: number
}

export interface SetEntry {
  weight: number | null
  reps: number | null
  done: boolean
  doneAt?: number
}

export interface SessionEntry {
  exerciseId: string
  unit: Unit
  sets: SetEntry[]
  /** Series de la última vez, para mostrar «Anterior». */
  previous: { weight: number | null; reps: number | null }[]
}

export type SessionStatus = 'active' | 'paused' | 'done'

export interface Session {
  id: string
  routineId: string | null
  /** true si la rutina se está creando en esta sesión. */
  isNewRoutine: boolean
  name: string
  description?: string
  status: SessionStatus
  startedAt: number
  endedAt?: number
  /** Segundos acumulados antes de la última reanudación. */
  activeMs: number
  resumedAt: number
  entries: SessionEntry[]
  currentIndex: number
  notes?: string
}

export interface Pref { key: string; value: unknown }

class PulsoDB extends Dexie {
  exercises!: Table<Exercise, string>
  routines!: Table<Routine, string>
  sessions!: Table<Session, string>
  prefs!: Table<Pref, string>

  constructor() {
    super('pulso')
    this.version(1).stores({
      exercises: 'id, name, muscle, custom',
      routines: 'id, updatedAt, lastUsedAt',
      sessions: 'id, status, routineId, startedAt, endedAt',
      prefs: 'key',
    })
  }
}

export const db = new PulsoDB()

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))
