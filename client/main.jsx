import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Root.jsx'
import AppProviders from './app/providers.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProviders>
    <App />
  </AppProviders>
)
