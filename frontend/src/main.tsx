import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
// @ts-ignore CSS side-effect imports are handled by the bundler.
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
