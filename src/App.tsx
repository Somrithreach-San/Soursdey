'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { RightSidebar } from './components/layout/RightSidebar'
import { MobileTopBar } from './components/layout/MobileTopBar'
import { LearnPage } from './pages/LearnPage'
import { StorePage } from './pages/StorePage'
import { LettersPage } from './pages/LettersPage'
import { PracticePage } from './pages/PracticePage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { LessonPage } from './pages/LessonPage'
import LessonComplete from './pages/LessonComplete.tsx'
import QuestsPage from './pages/QuestsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { UpdatePasswordPage } from './pages/UpdatePasswordPage'
import { cn } from './lib/utils'
import { useUser } from './contexts'
import { supabase } from './lib/supabase'
import { Loader } from './components/ui/Loader'
import { ScrollToTop } from './components/ui/ScrollToTop'
import { type Challenge, type Lesson } from './services'

function App() {
  const { user, isAuthenticated, isLoading, profile, quests, refreshProfile } = useUser()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'learn' | 'shop' | 'letters' | 'practice' | 'profile' | 'lesson' | 'lesson-complete' | 'quests' | 'leaderboard' | 'update-password' | 'settings'>('learn')
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [currentLessonData, setCurrentLessonData] = useState<{ lesson: Lesson; challenges: Challenge[] } | null>(null)
  const [lessonCompleteParams, setLessonCompleteParams] = useState<{ 
    perfect: boolean; 
    accuracy: number; 
    duration: number; 
    lessonType?: 'review' | 'mistakes';
    xpEarned?: number;
    gemsEarned?: number;
  }>({ perfect: false, accuracy: 0, duration: 0 });

  // Reset scroll position to top whenever the view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '', // Refresh token is not available here
        }).then(() => {
          setView('update-password')
        })
      }
    }
  }, [])

  const handleStartLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId)
    setCurrentLessonData(null)
    setView('lesson')
  }, [])

  const handleStartReviewLesson = useCallback((lessonData: { lesson: Lesson; challenges: Challenge[] }) => {
    setCurrentLessonData(lessonData)
    setCurrentLessonId(null)
    setView('lesson')
  }, [])

  const handleLessonComplete = useCallback(async (result: { perfect: boolean; accuracy: number; duration: number; lessonType?: 'review' | 'mistakes' }) => {
    if (user && profile) {
      // Find the 'Complete 1 Lesson' quest from the user's active quests
      const lessonQuest = quests.find(q => q.quests.title === 'Complete 1 Lesson');

      if (lessonQuest && !lessonQuest.is_completed) {
        const newProgress = lessonQuest.progress + 1;
        const isCompleted = newProgress >= lessonQuest.quests.target;

        // Update the specific user_quest record in the database
        const { error: updateQuestError } = await supabase
          .from('user_quests')
          .update({ 
            progress: newProgress,
            is_completed: isCompleted,
          })
          .eq('id', lessonQuest.id); // Use the ID of the user_quest record

        if (updateQuestError) {
          console.error('Error updating quest progress:', updateQuestError);
        } else {
          // Refresh profile and quests to get the latest data
          await refreshProfile();
        }
      }
    }

    setLessonCompleteParams({ 
      perfect: result.perfect, 
      accuracy: result.accuracy, 
      duration: result.duration, 
      lessonType: result.lessonType,
      xpEarned: result.perfect ? 20 : 10,
      gemsEarned: result.perfect ? 30 : 15
    });
    setView('lesson-complete');
  }, [user, profile, quests, refreshProfile])

  const handleExitLesson = useCallback(() => {
    setView('learn')
  }, [])

  useEffect(() => {
    if (!user) return

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

  // Only show loading if we're authenticated but still fetching profile
  // Don't block auth pages from rendering - this prevents input data loss
  if (isAuthenticated && (!profile || isLoading)) {
    return (
      <div className="bg-duo-dark min-h-screen text-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl font-black text-duo-green mb-2">Soursdey</h1>
          <Loader />
        </div>
      </div>
    )
  }

  if (view === 'update-password') {
    return <UpdatePasswordPage />
  }

  // Auth pages - always render these if not authenticated, even if initial auth check is still running
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
      "bg-duo-dark min-h-screen text-[var(--text-main)] selection:bg-duo-green selection:text-white",
      view !== 'lesson' && view !== 'lesson-complete' && "lg:pl-72 pb-20 lg:pb-0"
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
          onQuestsClick={() => setView('quests')}
          onLeaderboardClick={() => setView('leaderboard')}
          onSettingsClick={() => setView('settings')}
        />
      )}

      {view !== 'lesson' && view !== 'lesson-complete' && (
        <MobileTopBar 
          profile={profile} 
          onSettingsClick={() => setView('settings')}
          onShopClick={() => setView('shop')}
        />
      )}
      
      {view === 'lesson' ? (
        <LessonPage 
          lessonId={currentLessonId ?? undefined}
          lessonData={currentLessonData ?? undefined}
          onExit={handleExitLesson} 
          onSettingsClick={() => setView('settings')}
          onShopClick={() => setView('shop')}
          onComplete={handleLessonComplete} 
        />
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
        <div className="flex justify-center lg:gap-12 pt-0">
          <main className={cn(
            "w-full transition-all duration-500 overflow-x-hidden",
            view === 'shop' ? "max-w-5xl" : "max-w-160"
          )}>
            {view === 'learn' && <LearnPage onStartLesson={handleStartLesson} />}
            {view === 'shop' && <StorePage />}
            {view === 'letters' && <LettersPage />}
            {view === 'practice' && <PracticePage onStartLesson={handleStartReviewLesson} />}
            {view === 'quests' && <QuestsPage />}
            {view === 'leaderboard' && <LeaderboardPage />}
            {view === 'settings' && <SettingsPage />}
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

          {(view === 'learn' || view === 'letters' || view === 'practice' || view === 'profile' || view === 'quests' || view === 'leaderboard' || view === 'settings') && (
            <div className="w-80 hidden xl:block">
              <RightSidebar 
                userProfile={profile} 
                onStoreClick={() => setView('shop')}
                onQuestsClick={() => setView('quests')}
                hideQuests={view === 'quests'}
              />
            </div>
          )}
        </div>
      )}
      {view === 'learn' && <ScrollToTop />}
    </div>
  )
}

export default App