import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './index.css'
import App from './App.tsx'
import { installEvent } from './screens/Profile'
import { initAnalytics } from './analytics'
import { registerSW } from 'virtual:pwa-register'

// Actualizaciones: al volver a la app se busca una versión nueva y, si hay, la app se recarga sola.
// Nunca durante un entrenamiento, para no cortar el descanso ni el temporizador.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => { if (document.visibilityState === 'visible' && !location.pathname.startsWith('/sesion')) reg.update().catch(() => {}) }
    document.addEventListener('visibilitychange', check)
    setInterval(check, 30 * 60 * 1000)
  },
})

// Android/Chrome: guardamos el aviso de instalación para lanzarlo desde «Instalar PULSO».
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  installEvent.current = e as typeof installEvent.current
  window.dispatchEvent(new Event('pulso-installable'))
})

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
