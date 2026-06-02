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
import QuestsPage from './pages/QuestsPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { UpdatePasswordPage } from './pages/UpdatePasswordPage'
import { cn } from './lib/utils'
import { useUser } from './contexts'
import { supabase } from './lib/supabase'
import lily from './assets/Lily.png'
import { Loader } from './components/ui/Loader'
import { calculateHeartsToRegenerate, MAX_HEARTS, HEART_REGENERATION_TIME } from './lib/hearts'
import { type Challenge, type Lesson } from './services'

function App() {
  const { user, isAuthenticated, isLoading, profile, quests, refreshProfile } = useUser()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'learn' | 'shop' | 'letters' | 'practice' | 'profile' | 'lesson' | 'lesson-complete' | 'quests' | 'update-password'>('learn')
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [currentLessonData, setCurrentLessonData] = useState<{ lesson: Lesson; challenges: Challenge[] } | null>(null)
  const [lessonCompleteParams, setLessonCompleteParams] = useState<{ perfect: boolean; accuracy: number; duration: number; lessonType?: 'review' | 'mistakes' }>({ perfect: false, accuracy: 0, duration: 0 });

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

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId)
    setCurrentLessonData(null)
    setView('lesson')
  }

  const handleStartReviewLesson = (lessonData: { lesson: Lesson; challenges: Challenge[] }) => {
    setCurrentLessonData(lessonData)
    setCurrentLessonId(null)
    setView('lesson')
  }

  const handleLessonComplete = async (result: { perfect: boolean; accuracy: number; duration: number; lessonType?: 'review' | 'mistakes' }) => {
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

    setView('lesson-complete');
    setLessonCompleteParams({ perfect: result.perfect, accuracy: result.accuracy, duration: result.duration, lessonType: result.lessonType });
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
        // Extract username from email by removing everything after @
        const defaultUsername = user.email?.split('@')[0] || 'new_user'
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: defaultUsername,
            email: user.email,
            avatar_url: lily, // Default avatar
            streak: 0,
            diamonds: 10,
            hearts: 5,
            created_at: new Date().toISOString(),
            last_heart_update: new Date().toISOString(),
            last_streak_update: null,
            streak_dates: [],
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
      "bg-duo-dark min-h-screen text-white selection:bg-duo-green selection:text-white",
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
        />
      )}
      
      {view === 'lesson' ? (
        <LessonPage 
          lessonId={currentLessonId ?? undefined}
          lessonData={currentLessonData ?? undefined}
          onExit={() => setView('learn')} 
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
        <div className="flex justify-center gap-12 pt-0">
          <main className={cn(
            "w-full transition-all duration-500",
            view === 'shop' ? "max-w-5xl" : "max-w-160"
          )}>
            {view === 'learn' && <LearnPage onStartLesson={handleStartLesson} />}
            {view === 'shop' && <StorePage />}
            {view === 'letters' && <LettersPage />}
            {view === 'practice' && <PracticePage onStartLesson={handleStartReviewLesson} />}
            {view === 'quests' && <QuestsPage />}
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

          {(view === 'learn' || view === 'letters' || view === 'practice' || view === 'profile' || view === 'quests') && (
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
    </div>
  )
}

export default App