import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './index.css'
import App from './App.tsx'
import { installEvent } from './screens/Profile'
import { initAnalytics } from './analytics'

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
