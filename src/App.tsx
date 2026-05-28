import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { RightSidebar } from './components/layout/RightSidebar'
import { LearnPage } from './pages/LearnPage'
import { StorePage } from './pages/StorePage'
import { LettersPage } from './pages/LettersPage'
import { PracticePage } from './pages/PracticePage'
import { ProfilePage } from './pages/ProfilePage'
import { LessonPage } from './pages/LessonPage'
import { cn } from './lib/utils'

function App() {
  const [view, setView] = useState<'learn' | 'shop' | 'letters' | 'practice' | 'profile' | 'lesson'>('learn')

  return (
    <div className={cn(
      "bg-duo-dark min-h-screen text-white selection:bg-duo-green selection:text-white",
      view !== 'lesson' && "pl-72"
    )}>
      {view !== 'lesson' && (
        <Sidebar 
          currentView={view}
          onStoreClick={() => setView('shop')} 
          onLearnClick={() => setView('learn')}
          onLettersClick={() => setView('letters')}
          onPracticeClick={() => setView('practice')}
          onProfileClick={() => setView('profile')}
        />
      )}
      
      {view === 'lesson' ? (
        <LessonPage onExit={() => setView('learn')} />
      ) : (
        <div className="flex justify-center gap-12 pt-0">
          <main className={cn(
            "w-full transition-all duration-500",
            view === 'shop' ? "max-w-5xl" : "max-w-[640px]"
          )}>
            {view === 'learn' && <LearnPage onStartLesson={() => setView('lesson')} />}
            {view === 'shop' && <StorePage />}
            {view === 'letters' && <LettersPage />}
            {view === 'practice' && <PracticePage />}
            {view === 'profile' && <ProfilePage />}
          </main>

          {(view === 'learn' || view === 'letters' || view === 'practice' || view === 'profile') && (
            <div className="w-80 hidden xl:block">
              <RightSidebar onStoreClick={() => setView('shop')} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
