import posthog from 'posthog-js'
import { getPrefs, setPref } from './db/logic'
import { uid } from './db/db'

/** Clave pública del proyecto de PostHog (es pública por diseño). */
const KEY = 'phc_mxFJHpVytnGnHLVhMHhfbRGNYVbxi8UC2dZ742CMGAsi'
// Solo se mide la versión publicada, para no mezclar pruebas locales con datos de testers.
const enabled = import.meta.env.PROD

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

export async function initAnalytics() {
  if (!enabled) return
  posthog.init(KEY, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: 'history_change',
    session_recording: { maskAllInputs: false, maskInputOptions: { password: true } },
  })
  const p = await getPrefs()
  let id = p.deviceId
  if (!id) { id = uid(); await setPref('deviceId', id) }
  posthog.identify(id, p.name ? { name: p.name } : undefined)
  posthog.register({ standalone: isStandalone() })
  track('app_opened', { standalone: isStandalone() })
}

export function identifyName(name: string) {
  if (!enabled) return
  posthog.setPersonProperties({ name })
}

/** Eventos del caso de estudio. Nombres en inglés para filtrarlos fácil en PostHog. */
export type EventName =
  | 'app_opened' | 'install_skipped' | 'install_accepted'
  | 'session_started' | 'session_paused' | 'session_resumed' | 'session_discarded' | 'session_finished'
  | 'exercise_added' | 'exercise_saved' | 'custom_exercise_created' | 'search_no_results'
  | 'keypad_opened' | 'set_completed' | 'set_unchecked' | 'set_undone' | 'set_added' | 'set_removed'
  | 'unit_changed' | 'rest_skipped' | 'rest_extended'
  | 'feedback_submitted'

export function track(event: EventName, props?: Record<string, unknown>) {
  if (!enabled) return
  posthog.capture(event, props)
}
