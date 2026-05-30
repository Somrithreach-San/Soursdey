'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { RightSidebar } from './components/layout/RightSidebar'
import { LearnPage } from './pages/LearnPage'
import { StorePage } from './pages/StorePage'
import { LettersPage } from './pages/LettersPage'
import { PracticePage } from './pages/PracticePage'
import { ProfilePage } from './pages/ProfilePage'
import { LessonPage } from './pages/LessonPage'
import LessonComplete from './pages/LessonComplete.tsx'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { cn } from './lib/utils'
import { useUser } from './contexts'
import { supabase } from './lib/supabase'
import lily from './assets/Lily.png'
import { Loader } from './components/ui/Loader'
import { calculateHeartsToRegenerate, MAX_HEARTS, HEART_REGENERATION_TIME } from './lib/hearts'

function App() {
  const { user, isAuthenticated, isLoading, profile, refreshProfile } = useUser()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'learn' | 'shop' | 'letters' | 'practice' | 'profile' | 'lesson' | 'lesson-complete'>('learn')
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [lessonCompleteParams, setLessonCompleteParams] = useState<{ perfect: boolean; accuracy: number; duration: number }>({ perfect: false, accuracy: 0, duration: 0 });

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId)
    setView('lesson')
  }

  const handleLessonComplete = (result: { perfect: boolean; accuracy: number; duration: number }) => {
    setView('lesson-complete');
    setLessonCompleteParams({ perfect: result.perfect, accuracy: result.accuracy, duration: result.duration });
  }

  useEffect(() => {
    if (!user) return

    const fetchUserProfile = async () => {
      // Fetch user's profile or create if it doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, so create it.
        const defaultUsername = user.email?.split('@')[0] || 'new_user'
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: defaultUsername,
            avatar_url: lily, // Default avatar
            streak: 0,
            diamonds: 10,
            hearts: 5,
          })
          .select('*')
          .single()

        if (createError) {
            console.error('Error creating profile:', createError)
          } else {
            // Profile created, refresh context to get latest data
            await refreshProfile()
          }
      } else if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else {
        const { heartsToAdd, needsUpdate } = calculateHeartsToRegenerate(profile.hearts, profile.last_heart_update);

        if (needsUpdate && heartsToAdd > 0) {
          const newHeartCount = Math.min(profile.hearts + heartsToAdd, MAX_HEARTS);
          // To be fair to the user, we don't just set the update time to NOW().
          // Instead, we add the time equivalent of the regenerated hearts to the last update time.
          // This preserves any partial progress towards the next heart.
          const newLastHeartUpdate = new Date(new Date(profile.last_heart_update).getTime() + heartsToAdd * HEART_REGENERATION_TIME).toISOString();

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              hearts: newHeartCount,
              last_heart_update: newLastHeartUpdate
            })
            .eq('id', user.id)
            .select('*')
            .single();
          
          if (updateError) {
            console.error('Error updating hearts:', updateError);
            await refreshProfile(); // Refresh context on error to get current data
          } else {
            // Update context profile with regenerated hearts
            await refreshProfile();
            console.log(`Regenerated ${heartsToAdd} heart(s). New count: ${newHeartCount}`);
          }
        } else {
          // Profile is already up-to-date in context
        }
      }
    }

    const fetchUserProgress = async () => {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      const { data: progress } = await supabase
        .from('user_progress')
        .select('last_accessed, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('last_accessed', threeMonthsAgo.toISOString())
        
      setUserProgress(progress || [])
    }

    fetchUserProfile()
    fetchUserProgress()

  }, [user])

  const handleUpdateUsername = async (newUsername: string) => {
    if (!user || !newUsername.trim()) return false

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile();
      return true
    } catch (error) {
      console.error('Error updating username:', error)
      return false
    }
  }

  const handleUpdateAvatar = async (newAvatar: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatar })
        .eq('id', user.id)

      if (error) throw error
      
      await refreshProfile();
      return true
    } catch (error) {
      console.error('Error updating avatar:', error)
      return false
    }
  }

  // Loading state
  if (isLoading || (isAuthenticated && !profile)) {
    return (
      <div className="bg-duo-dark min-h-screen text-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl font-black text-duo-green mb-2">Soursdey</h1>
          <Loader />
        </div>
      </div>
    )
  }

  // Auth pages
  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage onSignupClick={() => setAuthView('signup')} />
        ) : (
          <SignupPage onLoginClick={() => setAuthView('login')} />
        )}
      </>
    )
  }

  // Main app
  return (
    <div className={cn(
      "bg-duo-dark min-h-screen text-white selection:bg-duo-green selection:text-white",
      view !== 'lesson' && view !== 'lesson-complete' && "pl-72"
    )}>
      {view !== 'lesson' && view !== 'lesson-complete' && (
        <Sidebar 
          userProfile={profile}
          currentView={view}
          onStoreClick={() => setView('shop')} 
          onLearnClick={() => setView('learn')}
          onLettersClick={() => setView('letters')}
          onPracticeClick={() => setView('practice')}
          onProfileClick={() => setView('profile')}
        />
      )}
      
      {view === 'lesson' ? (
        <LessonPage lessonId={currentLessonId!} onExit={() => setView('learn')} onComplete={handleLessonComplete} />
      ) : view === 'lesson-complete' ? (
        <LessonComplete 
          route={{ params: lessonCompleteParams }} 
          navigation={{ 
            navigate: (view: any) => setView(view),
            restartLesson: () => {
              setView('lesson')
            }
          }} 
        />
      ) : (
        <div className="flex justify-center gap-12 pt-0">
          <main className={cn(
            "w-full transition-all duration-500",
            view === 'shop' ? "max-w-5xl" : "max-w-160"
          )}>
            {view === 'learn' && <LearnPage onStartLesson={handleStartLesson} />}
            {view === 'shop' && <StorePage />}
            {view === 'letters' && <LettersPage />}
            {view === 'practice' && <PracticePage />}
            {view === 'profile' && (
              <ProfilePage 
                user={user}
                userProfile={profile}
                userProgress={userProgress}
                onUpdateUsername={handleUpdateUsername}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}
          </main>

          {(view === 'learn' || view === 'letters' || view === 'practice' || view === 'profile') && (
            <div className="w-80 hidden xl:block">
              <RightSidebar userProfile={profile} onStoreClick={() => setView('shop')} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App