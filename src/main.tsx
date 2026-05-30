import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UserProvider, LessonProvider, StoreProvider } from './contexts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <LessonProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </LessonProvider>
    </UserProvider>
  </StrictMode>,
)
