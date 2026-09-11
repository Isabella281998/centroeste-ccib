import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import IBCCApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IBCCApp />
  </StrictMode>,
)
