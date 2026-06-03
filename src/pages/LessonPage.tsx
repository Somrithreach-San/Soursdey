import { useState, useEffect, useMemo, useRef } from 'react'
import { X, Settings, Infinity as InfinityIcon, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { supabase } from '../lib/supabase'
import { useUser, useLesson } from '../contexts'
import hearts from '../assets/hearts.png'
import jason from '../assets/Jason.png'
import speakerIcon from '../assets/speaker.png'
import { useSound } from '../hooks/useSound'
import correctSound from '../assets/sounds/correct.mp3'
import wrongSound from '../assets/sounds/wrong.mp3'
import lessonCompleteSound from '../assets/sounds/lesson_complete.mp3'
import Lottie from 'lottie-react'
import plantAnimation from '../assets/plant.json'
import { type Challenge, type Lesson, recordMistake, clearUserMistakes } from '../services'

interface ChallengeOption {
  id: string
  challenge_id: string
  text: string
  phonetic: string | null
  is_correct: boolean
  audio_src: string | null
  image_src: string | null
  pair_id: number | null
}

const SpeechBubble = ({ text, phonetic }: { text: string; phonetic: string | null }) => (
  <div className="relative border-2 border-duo-border rounded-2xl p-4 bg-duo-dark max-w-md shadow-sm">
    {phonetic && (
      <p className="text-duo-gray text-sm font-bold mb-1">{phonetic}</p>
    )}
    <p className="text-white text-xl font-khmer font-medium leading-relaxed">{text}</p>
    <div className="absolute -left-2.25 top-1/2 -translate-y-1/2 w-4 h-4 bg-duo-dark border-b-2 border-l-2 border-duo-border rotate-45" />
  </div>
)

const LottiePlayer = (Lottie as unknown as { default: typeof Lottie }).default || Lottie;

interface LessonPageProps {
  lessonId?: string
  lessonData?: { lesson: Lesson; challenges: Challenge[] }
  onExit: () => void
  onComplete: (result: { perfect: boolean; accuracy: number; duration: number; lessonType?: 'review' | 'mistakes' }) => void
}

export const LessonPage = ({ 
  lessonId, 
  lessonData,
  onExit, 
  onComplete 
}: LessonPageProps) => {
  const [lesson, setLesson] = useState<Lesson & { challenges: Challenge[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [selectedSequence, setSelectedSequence] = useState<ChallengeOption[]>([])
  const [selectedPair, setSelectedPair] = useState<ChallengeOption[]>([])
  const [wrongPair, setWrongPair] = useState<ChallengeOption[]>([])
  const [solvedPairs, setSolvedPairs] = useState<number[]>([])
  
  // Set timestamp immediately upon instantiation and lock it down
  const startTimeRef = useRef<number>(Date.now())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const { profile, updateProfile, incrementUserStreak, removeUserHearts } = useUser()
  const { completeLesson } = useLesson()
  const playLessonCompleteSound = useSound(lessonCompleteSound)

  const deductHeart = async () => {
    if (profile?.is_subscribed) return
    await removeUserHearts(1)
  }

  // Check for hearts on mount/profile update
  useEffect(() => {
    if (profile && profile.hearts === 0 && !profile.is_subscribed && !isLoading && !isGameOver) {
      setIsGameOver(true)
    }
  }, [profile?.hearts, profile?.is_subscribed, isLoading, isGameOver])

  const currentChallenge = lesson?.challenges?.[currentChallengeIndex]

  const { leftOptions, rightOptions } = useMemo(() => {
    if (currentChallenge?.type === 'MATCHING') {
      const uniquePairIds = [...new Set(currentChallenge.options.map(o => o.pair_id).filter(id => id !== null))]
      const pairs = uniquePairIds.map(pairId => {
        const pairOptions = currentChallenge.options.filter(o => o.pair_id === pairId)
        // Assuming pairs are always in order in the DB, or we need a way to distinguish left/right
        return {
          left: pairOptions[0],
          right: pairOptions[1]
        }
      })

      const left = pairs.map(p => p.left)
      const right = pairs.map(p => p.right)

      // Shuffle each column independently
      for (let i = left.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [left[i], left[j]] = [left[j], left[i]];
        const k = Math.floor(Math.random() * (i + 1));
        [right[i], right[k]] = [right[k], right[i]];
      }
      
      return { leftOptions: left, rightOptions: right }
    }
    return { leftOptions: [], rightOptions: [] }
  }, [currentChallenge])

  // Clear sequences and manage audio between questions
  useEffect(() => {
    setSelectedSequence([])
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [currentChallengeIndex])

  // Single mount guarantee lock for duration clock tracker
  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  const handlePlaySound = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    const newAudio = new Audio(audioSrc)
    audioRef.current = newAudio
    newAudio.play().catch(error => console.error('Audio playback failed:', error))
    newAudio.onended = () => { audioRef.current = null }
  }

  const handlePlayChallengeSound = () => {
    if (currentChallenge?.audio_src) {
      handlePlaySound(currentChallenge.audio_src)
    } else {
      console.warn("No audio source URL specified for this current listening challenge row.")
    }
  }

  useEffect(() => {
    const initializeLesson = async () => {
      setIsLoading(true)
      try {
        // If lessonData is provided (e.g., for review lessons), use it directly
        if (lessonData) {
          const challengesWithSanitizedOptions = lessonData.challenges.map((c: Challenge) => ({
            id: c.id,
            lesson_id: c.lesson_id,
            type: c.type,
            instruction: c.instruction,
            question: c.question,
            phonetic: c.phonetic,
            order: c.order,
            audio_src: c.audio_src,
            correct_answer: c.correct_answer,
            options: c.options,
          }));

          setLesson({ 
            ...lessonData.lesson,
            challenges: challengesWithSanitizedOptions 
          } as any);
        } else if (lessonId) {
          // Fetch from database if only lessonId is provided
          const { data: lessonDataDb, error: lessonError } = await supabase
            .from('lessons')
            .select('*, challenges(id, lesson_id, type, instruction, question, phonetic, "order", audio_src, correct_answer, options:challenge_options(id, challenge_id, text, phonetic, is_correct, audio_src, image_src, pair_id))')
            .eq('id', lessonId)
            .order('order', { foreignTable: 'challenges', ascending: true })
            .maybeSingle()

          if (lessonError) {
            console.error('Error fetching lesson data payload:', lessonError.message)
            onExit()
            return
          }

          if (lessonDataDb && lessonDataDb.challenges) {
            const challengesWithSanitizedOptions = lessonDataDb.challenges.map((c: any) => ({
              id: c.id,
              lesson_id: c.lesson_id,
              type: c.type,
              instruction: c.instruction,
              question: c.question,
              phonetic: c.phonetic,
              order: c.order,
              audio_src: c.audio_src,
              correct_answer: c.correct_answer,
              options: c.options
                ? c.options.map((o: any) => ({
                    id: o.id,
                    challenge_id: o.challenge_id,
                    text: o.text,
                    phonetic: o.phonetic,
                    is_correct: o.is_correct,
                    audio_src: o.audio_src,
                    image_src: o.image_src,
                    pair_id: o.pair_id ?? null,
                  }))
                : [],
            }));

            setLesson({ ...lessonDataDb, challenges: challengesWithSanitizedOptions } as any);
          } else {
            console.warn('No structured lesson details found for given ID.')
            onExit()
          }
        } else {
          console.warn('No lesson data or lessonId provided')
          onExit()
        }
      } catch (err) {
        console.error('Unexpected runtime fetch exception:', err)
        onExit()
      } finally {
        setIsLoading(false)
      }
    }
    initializeLesson()
  }, [lessonId, lessonData, onExit])

  useEffect(() => {
    if (currentChallenge?.type === 'MATCHING') {
      // Reset state for new matching challenge
      setSolvedPairs([])
      setSelectedPair([])
      setWrongPair([])
    }
  }, [currentChallenge])

  useEffect(() => {
    if (currentChallenge?.type === 'MATCHING') {
      const totalPairs = currentChallenge.options.length / 2
      if (totalPairs > 0 && solvedPairs.length === totalPairs) {
        setStatus('correct')
      }
    }
  }, [solvedPairs, currentChallenge])

  const handleOptionClick = (option: ChallengeOption) => {
    if (status !== 'idle') return
    setSelectedOption(option.id)
    if (option.audio_src) {
      handlePlaySound(option.audio_src)
    }
  }

  const handleMatchingClick = async (option: ChallengeOption) => {
    if (status !== 'idle' || selectedPair.length === 2) return
    if (selectedPair.some(p => p.id === option.id)) return

    // Prevent matching within the same column
    const isOptionFromLeft = leftOptions.some(o => o.id === option.id)
    if (selectedPair.length === 1) {
      const selectedFromLeft = leftOptions.some(o => o.id === selectedPair[0].id)
      if (isOptionFromLeft === selectedFromLeft) return
    }

    if (option.audio_src) {
      handlePlaySound(option.audio_src)
    }

    const newSelectedPair = [...selectedPair, option]
    setSelectedPair(newSelectedPair)

    if (newSelectedPair.length === 2) {
      const [first, second] = newSelectedPair
      if (first.pair_id === second.pair_id) {
        handlePlaySound(correctSound)
        setSolvedPairs(prev => [...prev, first.pair_id!])
        setSelectedPair([])
      } else {
        handlePlaySound(wrongSound)
        setWrongPair(newSelectedPair)
        setMistakes(prev => prev + 1)
        // Record the mistake for both items in the pair
        if (profile && lesson) {
          await recordMistake(profile.id, first.challenge_id, lesson.id)
          await recordMistake(profile.id, second.challenge_id, lesson.id)
        }

        if (profile && profile.hearts <= 1 && !profile.is_subscribed) {
          await deductHeart()
          setIsGameOver(true)
        } else {
          await deductHeart()
          setTimeout(() => {
            setSelectedPair([])
            setWrongPair([])
          }, 800)
        }
      }
    }
  }

  const handleWrongAnswer = async () => {
    setStatus('wrong')
    
    // Pro users don't lose hearts
    if (!profile?.is_subscribed) {
      const newHearts = Math.max(0, (profile?.hearts || 0) - 1)
      await updateProfile({ hearts: newHearts })
      
      if (newHearts === 0) {
        setIsGameOver(true)
      }
    }
    
    setMistakes(prev => prev + 1)
    
    // Record mistake in database
    if (lesson && currentChallenge && profile) {
      await recordMistake(profile.id, currentChallenge.id, lesson.id)
    }
  }

  const handleWordBankClick = (option: ChallengeOption) => {
    if (status !== 'idle') return
    setSelectedSequence(prev => [...prev, option])
    if (option.audio_src) {
      handlePlaySound(option.audio_src)
    }
  }

  const handleSequenceClick = (index: number) => {
    if (status !== 'idle') return
    setSelectedSequence(prev => prev.filter((_, i) => i !== index))
  }

  const handleCheck = async () => {
    if (status !== 'idle' || !lesson || !lesson.challenges.length) return
    const currentChallenge = lesson.challenges[currentChallengeIndex]

    let isCorrect = false
    if (currentChallenge.type === 'LISTEN_AND_SELECT') {
      if (selectedSequence.length === 0) return
      const selectedAnswer = selectedSequence.map(item => item.text).join(' ')
      isCorrect = selectedAnswer === currentChallenge.correct_answer
    } else {
      if (!selectedOption) return
      const option = currentChallenge.options.find(o => o.id === selectedOption)
      isCorrect = !!option?.is_correct
    }

    if (isCorrect) {
      handlePlaySound(correctSound)
      setStatus('correct')
    } else {
      handlePlaySound(wrongSound)
      // Record the mistake
      await recordMistake(profile!.id, currentChallenge.id, lesson.id)
      
      if (profile && profile.hearts <= 1 && !profile.is_subscribed) {
        await deductHeart()
        setIsGameOver(true)
      } else {
        await deductHeart()
        setStatus('wrong')
        setMistakes(prev => prev + 1)
      }
    }
  }

  const handleSkip = async () => {
    if (status !== 'idle') return
    // Record the skip as a mistake
    if (lesson && currentChallenge) {
      await recordMistake(profile!.id, currentChallenge.id, lesson.id)
    }
    setMistakes(prev => prev + 1)
    handleContinue()
  }

  const handleContinue = async () => {
    if (!lesson) return

    const isLastChallenge = currentChallengeIndex === lesson.challenges.length - 1
    if (isLastChallenge) {
      playLessonCompleteSound()
      // Accuracy should be based on (correct answers / total attempts) or (total challenges / (total challenges + mistakes))
      // Standard way: (total challenges / (total challenges + mistakes)) * 100
      const totalChallenges = lesson.challenges.length
      const accuracy = Math.max(0, Math.round((totalChallenges / (totalChallenges + mistakes)) * 100))
      
      // Compute actual absolute duration execution delta
      const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      
      // Mark lesson as complete
      await completeLesson(lesson.id)

      // Determine lesson type
      let lessonType: 'review' | 'mistakes' | undefined
      if (lesson.id.startsWith('review-lesson-')) {
        lessonType = 'review'
      } else if (lesson.id.startsWith('mistakes-lesson-')) {
        lessonType = 'mistakes'
        // Clear mistakes after completing mistakes review
        if (profile) {
          await clearUserMistakes(profile.id)
        }
      }

      // Add gems: 30 for perfect/flawless, 15 for normal lessons
      const gemsToAdd = mistakes === 0 ? 30 : 15
      // Add XP: 20 for perfect, 10 for normal
      const xpToAdd = mistakes === 0 ? 20 : 10

      if (profile) {
        await updateProfile({ 
          diamonds: (profile.diamonds || 0) + gemsToAdd,
          xp: (profile.xp || 0) + xpToAdd 
        })
        // Increment streak after completing lesson
        await incrementUserStreak({ lessonCompleted: true })
      }
      
      onComplete({ perfect: mistakes === 0, accuracy, duration, lessonType })
      return
    }
    setCurrentChallengeIndex(prev => prev + 1)
    setStatus('idle')
    setSelectedOption(null)
  }

  const getChallengeContent = (challenge: Challenge) => {
    let displayInstruction = challenge.instruction
    let displayQuestion = challenge.question

    if (challenge.type === 'SELECT_IMAGE') {
      if (!displayInstruction) displayInstruction = "Select the correct meaning"
      const match = challenge.question.match(/"([^"]+)"/)
      if (match) displayQuestion = match[1]
    } else if (challenge.type === 'LISTEN_AND_SELECT' && !displayInstruction) {
      displayInstruction = "Tap what you hear"
    } else if (challenge.type === 'SELECT' && !displayInstruction) {
      displayInstruction = "Translate this word"
    } else if (challenge.type === 'MATCHING') {
      displayInstruction = challenge.question || "Select the matching pairs"
      displayQuestion = '' // No main question text for matching
    }

    return { instruction: displayInstruction, targetText: displayQuestion }
  }

  const options = currentChallenge?.options || []
  const progress = useMemo(() => {
    if (!lesson) return 0
    return status === 'correct'
      ? ((currentChallengeIndex + 1) / lesson.challenges.length) * 100
      : (currentChallengeIndex / lesson.challenges.length) * 100
  }, [lesson, currentChallengeIndex, status])

  const hasSelection = selectedOption !== null || selectedSequence.length > 0
  const { instruction, targetText } = currentChallenge ? getChallengeContent(currentChallenge) : { instruction: '', targetText: '' }

  if (isLoading || !lesson || !lesson.challenges.length || !currentChallenge) {
    return (
      <div className="fixed inset-0 bg-duo-dark z-100 flex items-center justify-center">
        <Loader className="w-12 h-12" />
      </div>
    )
  }

  return (
    <>
      {isGameOver && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
          <div className="bg-duo-dark p-8 rounded-2xl text-center border-2 border-duo-border max-w-sm w-full flex flex-col items-center gap-4">
            <div className="w-32 h-32">
              <LottiePlayer animationData={plantAnimation} loop={true} />
            </div>
            <h2 className="text-2xl font-black text-white">Mistakes help you grow!</h2>
            <p className="text-duo-gray font-bold">You're out of hearts. Come back tomorrow or refill them in the store.</p>
            <Button onClick={onExit} className="w-full" variant="primary" size="lg">
              Exit Lesson
            </Button>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-duo-dark z-100 flex flex-col h-screen select-none overflow-y-auto">
        {/* Header */}
        <header className="max-w-5xl mx-auto w-full px-4 pt-6 md:pt-10 pb-4 flex items-center gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onExit} className="text-duo-gray hover:text-white transition-colors">
              <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
            </button>
            <button className="text-duo-gray hover:text-white transition-colors hidden sm:block">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 h-3 md:h-4 bg-duo-border rounded-full overflow-hidden">
            <div
              className="h-full bg-duo-green transition-all duration-700 relative rounded-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <img src={hearts} alt="Hearts" className="w-6 h-6 md:w-8 md:h-8 shrink-0 object-contain" />
            <span className={cn(
              "font-bold text-base md:text-xl",
              profile?.is_subscribed ? "text-duo-blue" : "text-duo-red"
            )}>
              {profile?.is_subscribed ? <InfinityIcon className="w-5 h-5 md:w-6 md:h-6" /> : (profile?.hearts ?? 5)}
            </span>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-8 md:pt-24 pb-12 flex flex-col items-center">
          <div className="w-full max-w-3xl mx-auto">
            
            {/* Question Header Layout */}
            <div className={cn("w-full", currentChallenge.type === 'SELECT_IMAGE' ? "mb-12" : "mb-10")}>
              {currentChallenge.type === 'MATCHING' && (
                <div className="flex flex-col w-full text-left mb-8">
                  <span className="text-duo-gray text-lg md:text-xl font-bold uppercase tracking-wider">
                    {instruction}
                  </span>
                </div>
              )}
              {currentChallenge.type === 'SELECT_IMAGE' ? (
                <div className="flex flex-col text-left">
                  {instruction && (
                    <span className="text-duo-gray text-sm md:text-base font-bold uppercase tracking-wider mb-2">
                      {instruction}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    "{targetText}"
                  </h1>
                </div>
              ) : currentChallenge.type === 'LISTEN_AND_SELECT' ? (
                <div className="flex flex-col w-full text-left">
                  {instruction && (
                    <span className="text-duo-gray text-sm md:text-base font-bold uppercase tracking-wider mb-4">
                      {instruction}
                    </span>
                  )}
                  <div className="flex justify-center min-h-23 mb-2">
                    <button
                      onClick={handlePlayChallengeSound}
                      className="bg-duo-green rounded-2xl p-5 border-2 border-white/20 shadow-[0_4px_0_0_#1a7f0e] hover:bg-duo-dark-green transition-all active:translate-y-0.5 active:shadow-none"
                    >
                      <img src={speakerIcon} alt="Speaker" className="w-12 h-12" />
                    </button>
                  </div>
                </div>
              ) : currentChallenge.type === 'SELECT' || currentChallenge.type === 'ASSIST' ? (
                <div className="flex flex-col w-full">
                  {instruction && (
                    <span className="text-duo-gray text-sm md:text-base font-bold uppercase tracking-wider mb-6 text-left">
                      {instruction}
                    </span>
                  )}
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-24 h-24 relative shrink-0 flex items-center justify-center">
                    <img src={jason} alt="Character" className="w-full h-full object-contain" />
                  </div>
                    <div className="w-fit">
                      <SpeechBubble text={targetText} phonetic={currentChallenge.phonetic} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Interactive Options Area */}
            <div className="w-full">
              {currentChallenge.type === 'MATCHING' ? (
                <div className="flex flex-col md:flex-row justify-center gap-4 w-full max-w-3xl mx-auto">
                  {/* Left Column */}
                  <div className="flex flex-col gap-2 w-full md:w-1/2">
                    {leftOptions.map((option, index) => {
                      const isSelected = selectedPair.some(p => p.id === option.id)
                      const isSolved = solvedPairs.includes(option.pair_id!)
                      const isWrong = wrongPair.some(p => p.id === option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleMatchingClick(option)}
                          disabled={status !== 'idle' || isSolved || selectedPair.length === 2}
                          className={cn(
                            "bg-duo-dark border-2 rounded-xl p-3 flex items-center justify-start cursor-pointer transition-all active:translate-y-0.5 active:shadow-none min-h-20 text-left w-full",
                            status === 'idle' && !isSolved && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                            isWrong && "border-duo-red bg-duo-red/10 shadow-none",
                            isSelected && !isSolved && !isWrong && "border-duo-sky-light bg-duo-sky-light/10 shadow-none",
                            isSolved && "border-transparent bg-duo-green/20 opacity-40 pointer-events-none",
                            status !== 'idle' && !isSelected && !isSolved && "opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 border-2 border-duo-border rounded-lg bg-duo-dark/50">
                              <span className="text-white font-bold text-base">{index + 1}</span>
                            </div>
                            <span className="text-white text-base font-bold font-khmer">
                              {option.text}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-2 w-full md:w-1/2">
                    {rightOptions.map((option, index) => {
                      const isSelected = selectedPair.some(p => p.id === option.id)
                      const isSolved = solvedPairs.includes(option.pair_id!)
                      const isWrong = wrongPair.some(p => p.id === option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleMatchingClick(option)}
                          disabled={status !== 'idle' || isSolved || selectedPair.length === 2}
                          className={cn(
                            "bg-duo-dark border-2 rounded-xl p-3 flex items-center justify-start cursor-pointer transition-all active:translate-y-0.5 active:shadow-none min-h-20 text-left w-full",
                            status === 'idle' && !isSolved && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                            isWrong && "border-duo-red bg-duo-red/10 shadow-none",
                            isSelected && !isSolved && !isWrong && "border-duo-sky-light bg-duo-sky-light/10 shadow-none",
                            isSolved && "border-transparent bg-duo-green/20 opacity-40 pointer-events-none",
                            status !== 'idle' && !isSelected && !isSolved && "opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 border-2 border-duo-border rounded-lg bg-duo-dark/50">
                              <span className="text-white font-bold text-base">{index + 1 + leftOptions.length}</span>
                            </div>
                            <div className="flex flex-col items-start">
                              {option.phonetic && (
                                <span className="text-[12px] font-bold text-duo-gray leading-none mb-1 block">
                                  {option.phonetic}
                                </span>
                              )}
                              <span className="text-white text-base font-bold font-khmer">
                                {option.text}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : currentChallenge.type === 'LISTEN_AND_SELECT' ? (
                <>
                  {/* Word Bank Selection Drop Zone */}
                  <div className="flex items-center gap-3 p-4 border-b-2 border-duo-border h-24 w-full mb-8 flex-wrap">
                    {selectedSequence.map((option, index) => (
                      <button
                        key={`${option.id}-${index}`}
                        onClick={() => handleSequenceClick(index)}
                        disabled={status !== 'idle'}
                        className="flex flex-col items-center justify-center px-5 py-2.5 border-2 rounded-xl transition-all bg-duo-dark border-duo-border shadow-[0_2px_0_0_#37464f]"
                      >
                        {option.phonetic && (
                          <span className="text-[11px] font-bold text-duo-gray leading-none mb-1 block">
                            {option.phonetic}
                          </span>
                        )}
                        <span className="text-white font-bold font-khmer text-base leading-tight">
                          {option.text}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Word Bank Choices */}
                  <div className="flex flex-wrap justify-center gap-3.5">
                    {options.map(option => {
                      const isInSequence = selectedSequence.find(item => item.id === option.id)
                      return (
                        <button
                          key={option.id}
                          disabled={status !== 'idle' || !!isInSequence}
                          onClick={() => handleWordBankClick(option)}
                          className={cn(
                            "flex flex-col items-center justify-center px-6 py-3 border-2 rounded-xl transition-all active:translate-y-0.5 active:shadow-none min-h-16 min-w-24 bg-duo-dark",
                            status === 'idle' && !isInSequence && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                            isInSequence && "opacity-20 bg-duo-border/10 border-dashed",
                            status !== 'idle' && !isInSequence && "opacity-50"
                          )}
                        >
                          {!isInSequence && option.phonetic && (
                            <span className="text-[12px] font-bold text-duo-gray leading-none mb-1 block">
                              {option.phonetic}
                            </span>
                          )}
                          <span className={cn(
                            "font-bold font-khmer text-lg leading-tight block",
                            isInSequence ? "text-transparent" : "text-white"
                          )}>
                            {option.text}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : currentChallenge.type === 'SELECT_IMAGE' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {options.map((option, index) => {
                    const isSelected = selectedOption === option.id
                    const isCorrect = status === 'correct' && isSelected
                    const isWrong = status === 'wrong' && isSelected

                    return (
                      <button 
                        key={option.id} 
                        disabled={status !== 'idle'}
                        onClick={() => handleOptionClick(option)}
                        className={cn(
                          "bg-duo-dark border-2 rounded-xl p-5 flex flex-col items-center justify-between cursor-pointer transition-all active:translate-y-0.5 active:shadow-none relative min-h-64 w-full",
                          status === 'idle' && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                          isSelected && status === 'idle' && "border-duo-sky-light bg-duo-sky-light/10 shadow-none",
                          isCorrect && "border-duo-green bg-duo-green/10 shadow-none",
                          isWrong && "border-duo-red bg-duo-red/10 shadow-none",
                          status !== 'idle' && !isSelected && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "absolute bottom-3 right-3 w-6 h-6 border-2 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-colors",
                          status === 'idle' && "border-duo-border text-duo-gray",
                          isCorrect && "border-duo-green text-duo-green",
                          isWrong && "border-duo-red text-duo-red"
                        )}>
                          {index + 1}
                        </div>
                        {option.image_src && <img src={option.image_src} alt={option.text} className="w-full h-28 object-contain mb-3" />}
                        <div className="flex flex-col items-center">
                          {option.phonetic && (
                            <span className={cn(
                              "text-[13px] font-bold transition-colors leading-none mb-1 block",
                              status === 'idle' && "text-duo-gray",
                              isCorrect && "text-duo-green",
                              isWrong && "text-duo-red"
                            )}>
                              {option.phonetic}
                            </span>
                          )}
                          <span className={cn(
                            "text-white text-base font-bold text-center block",
                            isCorrect && "text-duo-green",
                            isWrong && "text-duo-red"
                          )}>
                            {option.text}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                // SELECT or ASSIST challenge type
                <div className="flex flex-col gap-4">
                  {options.map((option, index) => {
                    const isSelected = selectedOption === option.id
                    const isCorrect = status === 'correct' && isSelected
                    const isWrong = status === 'wrong' && isSelected

                    return (
                      <button
                        key={option.id}
                        disabled={status !== 'idle'}
                        onClick={() => handleOptionClick(option)}
                        className={cn(
                          "flex items-center px-5 py-4.5 border-2 rounded-xl transition-all group relative active:translate-y-0.5 active:shadow-none min-h-20 bg-duo-dark w-full",
                          status === 'idle' && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                          isSelected && status === 'idle' && "border-duo-sky-light bg-duo-sky-light/10 shadow-none",
                          isCorrect && "border-duo-green bg-duo-green/10 shadow-none",
                          isWrong && "border-duo-red bg-duo-red/10 shadow-none",
                          status !== 'idle' && !isSelected && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 border-2 rounded-lg flex items-center justify-center text-[11px] font-black mr-4 shrink-0 transition-colors",
                          status === 'idle' && "border-duo-border text-duo-gray",
                          isCorrect && "border-duo-green text-duo-green",
                          isWrong && "border-duo-red text-duo-red"
                        )}>
                          {index + 1}
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                          {option.phonetic && (
                            <span className={cn(
                              "text-[13px] font-bold transition-colors leading-none mb-1.5 block",
                              status === 'idle' && "text-duo-gray",
                              isCorrect && "text-duo-green",
                              isWrong && "text-duo-red"
                            )}>
                              {option.phonetic}
                            </span>
                          )}
                          <span className={cn(
                            "text-xl font-black font-khmer transition-colors leading-tight block",
                            status === 'idle' && "text-white",
                            isCorrect && "text-duo-green",
                            isWrong && "text-duo-red"
                          )}>
                            {option.text}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 py-6 md:py-10 px-4 transition-colors duration-300 border-duo-border bg-duo-dark shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {status === 'idle' ? (
                <Button variant="ghost" className="flex-1 md:flex-none md:px-16 py-4 md:py-5" onClick={handleSkip}>
                  Skip
                </Button>
              ) : (
                <div className="flex items-center gap-3 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-[#202f36] shrink-0">
                    {status === 'correct' ? (
                      <CheckCircle2 className="w-7 h-7 md:w-10 md:h-10 text-duo-green" fill="currentColor" stroke="#202f36" />
                    ) : (
                      <X className="w-7 h-7 md:w-10 md:h-10 text-duo-red" strokeWidth={4} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h2 className={cn(
                      "text-xl md:text-2xl font-black",
                      status === 'correct' ? "text-duo-green" : "text-duo-red"
                    )}>
                      {status === 'correct' ? 'Amazing!' : 'Correct solution:'}
                    </h2>

                    {status === 'wrong' && (
                      <div className="flex flex-col mb-1">
                        {options.find(o => o.is_correct)?.phonetic && (
                          <span className="text-duo-red font-bold text-xs md:text-sm">
                            {options.find(o => o.is_correct)?.phonetic}
                          </span>
                        )}
                        <span className="text-duo-red font-black text-base md:text-lg font-khmer">
                          {options.find(o => o.is_correct)?.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant={status === 'correct' ? "primary" : status === 'wrong' ? "danger" : (hasSelection ? "primary" : "ghost")}
              disabled={status === 'idle' && !hasSelection}
              className={cn(
                "w-full md:w-auto md:px-16 py-4 md:py-5 md:min-w-50 uppercase tracking-wider font-black",
                status === 'idle' && !hasSelection && "opacity-50 grayscale"
              )}
              onClick={status === 'idle' ? handleCheck : (status === 'wrong' ? () => setStatus('idle') : handleContinue)}
            >
              {status === 'idle' ? 'Check' : (status === 'wrong' ? 'Try Again' : (currentChallengeIndex === lesson.challenges.length - 1 ? 'Finish' : 'Continue'))}
            </Button>
          </div>
        </footer>
      </div>
    </>
  )
}