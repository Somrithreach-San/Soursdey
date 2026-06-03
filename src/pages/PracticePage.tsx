import { useState, useEffect } from 'react'
import { Repeat, Lock } from 'lucide-react'
import Lottie from 'lottie-react'
import oxData from '../assets/ox.json'
import { useUser } from '../contexts'
import { getCompletedLessonsWithChallenges, getUserMistakes, type Challenge, type Lesson } from '../services'
import { Loader } from '../components/ui/Loader'
import { cn } from '../lib/utils'

// Fix for Lottie default import issues in some environments
const LottiePlayer = (Lottie as unknown as { default: typeof Lottie }).default || Lottie;

interface PracticeCardProps {
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  badge?: string
  onClick?: () => void
  disabled?: boolean
}

const PracticeCard = ({ title, description, icon: Icon, iconColor, badge, onClick, disabled, isLocked }: PracticeCardProps & { isLocked?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled || isLocked}
    className={cn(
      "w-full bg-[#1a232e] border-2 border-white/10 rounded-[20px] flex items-stretch overflow-hidden hover:bg-[#252f3d] transition-all group active:translate-y-[2px] relative shadow-[0_4px_0_0_rgba(255,255,255,0.05)] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed",
      isLocked && "grayscale-[0.5] opacity-70"
    )}
  >
    <div className="flex-1 p-5 md:p-6 text-left flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-bold text-lg md:text-xl text-white">{title}</h3>
        {isLocked && (
          <div className="bg-duo-green text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase text-white shadow-[0_1px_0_0_#46a302]">
            PRO
          </div>
        )}
      </div>
      <p className="text-duo-gray text-sm md:text-base font-bold leading-snug">{description}</p>
    </div>

    <div className="w-20 md:w-24 flex items-center justify-center pr-5 md:pr-6">
      <div className={cn(
        "w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-[0_4px_0_0_rgba(255,255,255,0.1)] active:translate-y-[2px] active:shadow-none transition-all relative",
        iconColor
      )}>
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
        {badge && (
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-duo-orange text-white text-[12px] font-black flex items-center justify-center rounded-full shadow-lg">
            {badge}
          </div>
        )}
      </div>
    </div>
  </button>
)

export const PracticePage = ({ onStartLesson }: { onStartLesson?: (lessonData: { lesson: Lesson; challenges: Challenge[] }) => void }) => {
  const { userId, profile } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<Array<{ lesson: Lesson; challenges: Challenge[] }> | null>(null)
  const [userMistakes, setUserMistakes] = useState<Array<{ challenge: Challenge; lessonId: string; mistakeCount: number }> | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return
      
      setIsLoading(true)
      try {
        const [completedLessonsData, mistakesData] = await Promise.all([
          getCompletedLessonsWithChallenges(userId),
          getUserMistakes(userId)
        ])
        setCompletedLessons(completedLessonsData)
        setUserMistakes(mistakesData)
      } catch (error) {
        console.error('Error loading data:', error)
        setCompletedLessons([])
        setUserMistakes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId])

  const handleStartReview = () => {
    if (!completedLessons || completedLessons.length === 0) return

    if (profile && profile.hearts === 0) {
      alert("You have no hearts left. Please refill in the store to continue.");
      return;
    }

    // Sample 1-3 challenges from each completed lesson
    const allChallenges: Challenge[] = []
    const reviewLessonTitle = 'Review Practice'

    completedLessons.forEach(({ challenges }) => {
      if (challenges.length > 0) {
        // Randomly select 1-3 challenges from this lesson
        const samplesToTake = Math.min(3, Math.max(1, Math.ceil(challenges.length / 3)))
        const shuffled = [...challenges].sort(() => Math.random() - 0.5)
        allChallenges.push(...shuffled.slice(0, samplesToTake))
      }
    })

    if (allChallenges.length === 0) return

    // Shuffle all challenges and create review lesson
    const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5)
    
    // Reassign order to match the new shuffle
    const reviewChallenges = shuffledChallenges.map((challenge, index) => ({
      ...challenge,
      order: index + 1,
    }))

    const reviewLesson: Lesson = {
      id: 'review-lesson-' + Date.now(),
      unit_id: '',
      title: reviewLessonTitle,
      order: 0,
      audio_src: null,
      created_at: new Date().toISOString(),
    }

    onStartLesson?.({ lesson: reviewLesson, challenges: reviewChallenges })
  }

  const handleStartMistakesReview = () => {
    if (!userMistakes || userMistakes.length === 0) return

    if (profile && profile.hearts === 0) {
      alert("You have no hearts left. Please refill in the store to continue.");
      return;
    }

    // Create a lesson from all mistakes
    const mistakeChallenges = userMistakes.map((m, index) => ({
      ...m.challenge,
      order: index + 1,
    }))

    const mistakesLesson: Lesson = {
      id: 'mistakes-lesson-' + Date.now(),
      unit_id: '',
      title: 'Mistakes Review',
      order: 0,
      audio_src: null,
      created_at: new Date().toISOString(),
    }

    onStartLesson?.({ lesson: mistakesLesson, challenges: mistakeChallenges })
  }

  const mistakesCount = userMistakes?.length || 0

  return (
    <div className="py-12 px-4 max-w-[640px] mx-auto">
      {/* Today's Review Section */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-white mb-5 tracking-tight uppercase">Today's Review</h2>
        {isLoading ? (
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-duo-green to-duo-dark-green p-8 min-h-[200px] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-duo-green to-duo-dark-green p-6 md:p-8 min-h-[200px] flex flex-col justify-between group">
            <div className="relative z-10 w-full md:max-w-[65%] text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h3 className="text-2xl font-black text-white leading-tight">Review Practice</h3>
                {!profile?.is_subscribed && (
                  <div className="bg-white text-duo-green text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-[0_2px_0_0_#e5e5e5]">
                    PRO
                  </div>
                )}
              </div>
              <p className="text-white/90 font-bold text-base leading-snug mb-6">
                Practice lessons you've completed to improve your skills!
              </p>
              <button 
                onClick={handleStartReview}
                disabled={!completedLessons || completedLessons.length === 0 || isLoading || !profile?.is_subscribed}
                className="bg-white text-duo-green font-black text-sm uppercase tracking-widest px-8 py-3 rounded-xl shadow-[0_4px_0_0_#e5e5e5] hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto flex items-center justify-center gap-2 mx-auto md:mx-0"
              >
                {!profile?.is_subscribed && <Lock className="w-4 h-4" />}
                {profile?.is_subscribed ? 'START PRACTICE' : 'LOCKED'}
              </button>
            </div>
            <div className="hidden md:flex absolute right-0 bottom-0 w-[35%] h-full items-end justify-end p-4">
               <div className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500">
                 <LottiePlayer animationData={oxData} loop={true} />
               </div>
            </div>
          </div>
        )}
      </section>

      {/* Your Collections Section */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-white mb-5 tracking-tight uppercase">Correct your mistakes</h2>
        <div className="space-y-4">
          <PracticeCard 
            title="Mistakes"
            description="Review and practice your mistakes to improve"
            icon={profile?.is_subscribed ? Repeat : Lock}
            iconColor="bg-duo-green"
            badge={mistakesCount > 0 ? mistakesCount.toString() : undefined}
            onClick={handleStartMistakesReview}
            disabled={mistakesCount === 0 || isLoading}
            isLocked={!profile?.is_subscribed}
          />
        </div>
      </section>
    </div>
  )
}