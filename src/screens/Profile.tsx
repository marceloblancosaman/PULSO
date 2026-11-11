import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronRight, Download, EllipsisVertical, Minus, Plus, Share, SquarePlus, Smartphone, Trash2 } from 'lucide-react'
import { db } from '../db/db'
import { getPrefs, setPref } from '../db/logic'
import { Dialog, Header, Screen, Segmented } from '../ui'
import posthog from '../posthog'

/* 41 · Perfil */
export function Profile() {
  const nav = useNavigate()
  const prefs = useLiveQuery(getPrefs, [])
  const [edit, setEdit] = useState<string | null>(null)
  const [wipe, setWipe] = useState(false)
  if (!prefs) return <Screen nav>{null}</Screen>
  return (
    <Screen nav>
      <div className="h1">Perfil</div>
      <button className="card row" style={{ textAlign: 'left' }} onClick={() => setEdit(prefs.name)}>
        <div className="avatar">{(prefs.name || 'P').charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}><div className="title" style={{ fontWeight: 600 }}>{prefs.name || 'Sin nombre'}</div><div className="label" style={{ fontWeight: 400 }}>Toca para cambiar tu nombre</div></div>
      </button>
      <div className="stack" style={{ gap: 8 }}>
        <button className="settings-row" onClick={() => nav('/perfil/preferencias')}><span className="grow">Preferencias de entrenamiento</span><span className="muted">{prefs.unit} · {prefs.restSeconds} s</span><ChevronRight size={18} className="muted" /></button>
        <button className="settings-row" onClick={() => nav('/historial')}><span className="grow">Historial</span><ChevronRight size={18} className="muted" /></button>
        <button className="settings-row" onClick={() => nav('/ejercicios')}><span className="grow">Catálogo de ejercicios</span><ChevronRight size={18} className="muted" /></button>
        <button className="settings-row" onClick={() => nav('/instalar?desde=perfil')}><span className="grow">Instalar la app</span><ChevronRight size={18} className="muted" /></button>
        <button className="settings-row danger" onClick={() => setWipe(true)}><Trash2 size={18} /><span className="grow">Borrar todos mis datos</span></button>
      </div>
      <div className="caption" style={{ fontWeight: 400 }}>Por ahora tus datos se guardan solo en este teléfono.</div>

      {edit !== null && (
        <Dialog title="Tu nombre" onClose={() => setEdit(null)}>
          <input className="input" value={edit} onChange={e => setEdit(e.target.value)} autoFocus />
          <button className="btn btn-primary" onClick={async () => { await setPref('name', edit.trim()); setEdit(null) }}>Guardar</button>
        </Dialog>
      )}
      {wipe && (
        <Dialog title="¿Borrar todos tus datos?" body="Se eliminarán tus rutinas, tu historial y tus ejercicios propios de este teléfono. Esta acción no se puede deshacer." onClose={() => setWipe(false)}>
          <button className="btn btn-destructive" onClick={async () => { await db.delete(); location.href = '/' }}>Borrar todo</button>
          <button className="btn btn-secondary" onClick={() => setWipe(false)}>Cancelar</button>
        </Dialog>
      )}
    </Screen>
  )
}

/* 42 · Preferencias */
export function Preferences() {
  const prefs = useLiveQuery(getPrefs, [])
  if (!prefs) return <Screen><Header /></Screen>
  const rest = prefs.restSeconds
  return (
    <Screen>
      <Header title="Preferencias" />
      <div className="row">
        <div style={{ flex: 1 }}><div className="title">Unidad predeterminada</div><div className="caption" style={{ fontWeight: 400 }}>Puedes cambiarla en cada ejercicio</div></div>
        <Segmented surface value={prefs.unit} onChange={v => setPref('unit', v)} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
      </div>
      <div className="row">
        <div style={{ flex: 1 }}><div className="title">Descanso entre series</div><div className="caption" style={{ fontWeight: 400 }}>Se inicia al registrar cada serie</div></div>
        <div className="stepper">
          <button aria-label="Menos descanso" onClick={() => setPref('restSeconds', Math.max(15, rest - 15))}><Minus size={18} /></button>
          <span>{rest >= 60 ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}` : `${rest} s`}</span>
          <button aria-label="Más descanso" onClick={() => setPref('restSeconds', Math.min(600, rest + 15))}><Plus size={18} /></button>
        </div>
      </div>
      <div className="caption" style={{ fontWeight: 400 }}>Los cambios se guardan automáticamente.</div>
    </Screen>
  )
}

/* 00a / 00b · Instala PULSO */
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export const installEvent = { current: null as BIP | null }

export function Install() {
  const nav = useNavigate()
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const [os, setOs] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android')
  const [canInstall, setCanInstall] = useState(!!installEvent.current)
  useEffect(() => { const f = () => setCanInstall(true); window.addEventListener('pulso-installable', f); return () => window.removeEventListener('pulso-installable', f) }, [])
  const steps = os === 'ios'
    ? [[<Share size={20} />, 'Toca el botón Compartir', 'Abajo en Safari, el cuadrado con la flecha.'], [<SquarePlus size={20} />, 'Elige «Agregar a inicio»', 'Desliza el menú si no lo ves.'], [<Smartphone size={20} />, 'Abre PULSO desde su ícono', 'Ya no necesitas Safari para usarla.']]
    : [[<Download size={20} />, 'Toca «Instalar PULSO»', 'O en el menú ⋮ de Chrome, «Instalar app».'], [<EllipsisVertical size={20} />, 'Confirma en el aviso', 'Se agregará a tu pantalla de inicio.'], [<Smartphone size={20} />, 'Abre PULSO desde su ícono', 'Funciona como cualquier otra app.']]
  async function skip() { await setPref('installDismissed', true); nav('/', { replace: true }) }
  async function install() {
    const e = installEvent.current
    if (!e) return
    await e.prompt(); const r = await e.userChoice; installEvent.current = null; setCanInstall(false); if (r.outcome === 'accepted') { posthog.capture('app_install_completed'); skip() }
  }
  return (
    <Screen>
      <div className="stack center" style={{ paddingTop: 8 }}>
        <img src="/logo.svg" width={120} height={120} alt="PULSO" />
        <div className="h2">Instala PULSO en tu teléfono</div>
        <div className="body">Se abre como una app, a pantalla completa y sin pasar por una tienda.</div>
      </div>
      <Segmented full surface value={os} onChange={setOs} options={[{ value: 'ios', label: 'iPhone' }, { value: 'android', label: 'Android' }]} />
      <div className="card stack" style={{ gap: 16, borderRadius: 20 }}>
        {steps.map(([ic, t, d], i) => (
          <div key={i} className="row" style={{ gap: 14 }}>
            <div className="thumb" style={{ width: 40, height: 40 }}>{ic}</div>
            <div><div className="title" style={{ fontWeight: 600, fontSize: 15 }}>{i + 1}. {t}</div><div className="label" style={{ fontWeight: 400 }}>{d}</div></div>
          </div>
        ))}
      </div>
      <div className="spacer" />
      {os === 'android' && canInstall && <button className="btn btn-primary" onClick={install}>Instalar PULSO</button>}
      <button className="btn btn-tertiary" onClick={skip}>Seguir en el navegador</button>
    </Screen>
  )
}

/* 02 · Bienvenida (primer uso) */
export function Welcome() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  return (
    <Screen>
      <div className="stack center" style={{ paddingTop: 32 }}>
        <img src="/logo.svg" width={120} height={120} alt="" />
        <div className="h1">Entrena con intención. Mira tu progreso.</div>
        <div className="body">Registra tus series sin esfuerzo y consulta lo que levantaste, sin depender de la memoria.</div>
      </div>
      <div className="spacer" />
      <div className="field">
        <label htmlFor="nm">¿Cómo te llamas?</label>
        <input id="nm" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" autoComplete="given-name" />
      </div>
      <button className="btn btn-primary" disabled={!name.trim()} onClick={async () => { await setPref('name', name.trim()); posthog.capture('onboarding_completed'); nav('/', { replace: true }) }}>Empezar</button>
    </Screen>
  )
}
