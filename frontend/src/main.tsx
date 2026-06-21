import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { AdminApp } from './admin/AdminApp'
import { Landing } from './Landing'
import { Privacy } from './Privacy'
import { Terms } from './Terms'
import './styles/globals.css'
import './i18n'

const path = window.location.pathname

function Root() {
  if (path.startsWith('/admin')) return <AdminApp />
  if (path === '/privacy') return <Privacy />
  if (path === '/terms') return <Terms />
  if (path === '/' || path === '') return <Landing />
  // /app, /auth/callback, and everything else → main app
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
