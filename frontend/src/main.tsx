import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { AdminApp } from './admin/AdminApp'
import './styles/globals.css'

const isAdmin = window.location.pathname.startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
