import { type ReactNode, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, Dumbbell, House, ClipboardList, Play, ChartLine, User, X } from 'lucide-react'

export function Screen({ children, nav, className = '' }: { children: ReactNode; nav?: boolean; className?: string }) {
  return (
    <div className={`screen ${nav ? 'with-nav' : ''} ${className}`}>
      <div className="content">{children}</div>
      {nav && <BottomNav />}
    </div>
  )
}

export function Header({ title, onBack, right, close }: { title?: string; onBack?: () => void; right?: ReactNode; close?: boolean }) {
  const nav = useNavigate()
  return (
    <div className="header">
      <button className="icon-btn" aria-label={close ? 'Cerrar' : 'Atrás'} onClick={onBack ?? (() => nav(-1))}>
        {close ? <X size={22} /> : <ChevronLeft size={22} />}
      </button>
      {title && <div className="h3">{title}</div>}
      {right}
    </div>
  )
}

export function BottomNav() {
  const items = [
    { to: '/', label: 'Inicio', icon: <House size={20} /> },
    { to: '/rutinas', label: 'Rutinas', icon: <ClipboardList size={20} /> },
    { to: '/entrenar', label: 'Entrenar', icon: <Play size={22} fill="currentColor" />, cta: true },
    { to: '/progreso', label: 'Progreso', icon: <ChartLine size={20} /> },
    { to: '/perfil', label: 'Perfil', icon: <User size={20} /> },
  ]
  return (
    <nav className="nav">
      {items.map(i => (
        <NavLink key={i.to} to={i.to} end={i.to === '/'} className={({ isActive }) => `${isActive ? 'active' : ''} ${i.cta ? 'cta' : ''}`}>
          <span className="nav-ic">{i.icon}</span>{i.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (<>
    <div className="scrim" onClick={onClose} />
    <div className="sheet" role="dialog"><div className="handle" />{children}</div>
  </>)
}

export function Dialog({ title, body, children, onClose }: { title: string; body?: ReactNode; children: ReactNode; onClose: () => void }) {
  return (<>
    <div className="scrim" onClick={onClose} />
    <div className="dialog" role="alertdialog">
      <div className="h3">{title}</div>
      {body && <div className="body">{body}</div>}
      <div className="stack" style={{ marginTop: 8 }}>{children}</div>
    </div>
  </>)
}

export function Snack({ children, action, onAction, onTimeout, ms = 4000, top, raised }: { children: ReactNode; action?: string; onAction?: () => void; onTimeout?: () => void; ms?: number; top?: boolean; raised?: boolean }) {
  useEffect(() => { if (!onTimeout) return; const t = setTimeout(onTimeout, ms); return () => clearTimeout(t) }, [onTimeout, ms])
  return (
    <div className={`snack ${top ? 'toast-top' : ''}`} style={raised ? { bottom: 'calc(var(--safe-bottom) + 88px)' } : undefined} role="status">
      <div className="grow">{children}</div>
      {action && <button className="link" onClick={onAction}>{action}</button>}
    </div>
  )
}

export function Segmented<T extends string>({ value, options, onChange, full, surface }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; full?: boolean; surface?: boolean }) {
  return (
    <div className={`seg ${full ? 'full' : ''} ${surface ? 'surface' : ''}`} role="radiogroup">
      {options.map(o => (
        <button key={o.value} role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

export function Thumb({ lg }: { lg?: boolean }) {
  return <div className={`thumb ${lg ? 'lg' : ''}`}><Dumbbell size={lg ? 28 : 24} /></div>
}

export function EmptyState({ icon, title, body, children }: { icon: ReactNode; title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-ic">{icon}</div>
      <div className="h3">{title}</div>
      {body && <div className="body">{body}</div>}
      {children && <div className="stack" style={{ width: '100%', marginTop: 8 }}>{children}</div>}
    </div>
  )
}
