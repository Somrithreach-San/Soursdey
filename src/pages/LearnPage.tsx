import { useEffect, useState, useRef, useMemo } from 'react'
import { Check, Star, Languages, Trophy } from 'lucide-react'
import { useLottie } from 'lottie-react'
import { cn } from '../lib/utils'
import { useUser, useLesson, useTheme } from '../contexts'
import { type Lesson } from '../services'
import { Loader } from '../components/ui/Loader'
import characterAnimation1 from '../assets/peacock.json'
import characterAnimation2 from '../assets/chimpanzee.json'
import characterAnimation3 from '../assets/goat.json'

// Default color schemes for units
const defaultColorSchemes: { [key: string]: { color: string; darkColor: string; lightColor: string } } = {
  '1': { color: '#58cc02', darkColor: '#46a302', lightColor: '#a5e67e' },
  '2': { color: '#ff9600', darkColor: '#e68700', lightColor: '#ffc800' },
  '3': { color: '#B68758', darkColor: '#966a3e', lightColor: '#d4b48d' },
}

const UnitDivider = ({ title }: { title: string }) => (
  <div className="w-full flex items-center gap-6 my-8 md:my-10">
    <div className="flex-1 h-0.5 bg-duo-border"></div>
    <span className="text-duo-gray font-bold uppercase tracking-[0.2em] text-sm whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-0.5 bg-duo-border"></div>
  </div>
)

const CharacterAnimation = ({ animationData, speed = 0.5 }: { animationData: unknown, speed?: number }) => {
  const options = useMemo(() => ({
    animationData,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }), [animationData])

  const lottieObj = useLottie(options)

  useEffect(() => {
    lottieObj.setSpeed(speed)
  }, [lottieObj, speed])

  return <div className="w-full h-full will-change-transform">{lottieObj.View}</div>
}

export const LearnPage = ({ onStartLesson }: { onStartLesson?: (lessonId: string) => void }) => {
  const { theme } = useTheme()
  const { 
    units, 
    lessons, 
    lessonProgress,
    loadingStates, 
    fetchUnits, 
    fetchLessons,
    fetchLessonProgress
  } = useLesson()
  const { profile } = useUser()
  const isLoading = loadingStates.units
  const [activeUnit, setActiveUnit] = useState<any>(null)
  const unitRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc
      audioRef.current.play()
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchUnits()
      await fetchLessonProgress()
    }
    fetchData()
  }, [fetchUnits, fetchLessonProgress])
  
  useEffect(() => {
    if (units) {
      fetchLessons(units)
    }
  }, [units, fetchLessons])

  // Memoize completed lessons to prevent re-renders
  const completedLessons = useMemo(() => {
    if (!lessonProgress) return {}
    return lessonProgress.reduce((acc, progress) => {
      if (progress.completed) {
        acc[progress.lesson_id] = true
      }
      return acc
    }, {} as { [key: string]: boolean })
  }, [lessonProgress])

  // Find the first unit that is not fully completed to mark as active
  const activeUnitId = useMemo(() => {
    if (!units || !lessonProgress) return null;

    // Create a map of lessons per unit
    const lessonsByUnit = units.reduce((acc, unit) => {
      acc[unit.id] = lessons?.filter(l => l.unit_id === unit.id) || [];
      return acc;
    }, {} as { [key: string]: Lesson[] });

    // Create a map of completed lessons per unit
    const completedLessonsByUnit = units.reduce((acc, unit) => {
      const unitLessons = lessonsByUnit[unit.id];
      const completed = unitLessons.filter(l => completedLessons[l.id]);
      acc[unit.id] = completed.length;
      return acc;
    }, {} as { [key: string]: number });

    // Find the first unit where the number of completed lessons is less than the total lessons
    for (const unit of units) {
      const total = lessonsByUnit[unit.id]?.length || 0;
      const completed = completedLessonsByUnit[unit.id] || 0;
      if (completed < total) {
        return unit.id;
      }
    }

    // If all units are complete, default to the first unit
    return units[0]?.id || null;
  }, [units, lessons, lessonProgress, completedLessons]);

  const firstUncompletedLessonId = useMemo(() => {
    if (!activeUnitId || !lessons) return null;

    const activeUnitLessons = lessons.filter(l => l.unit_id === activeUnitId);

    for (const lesson of activeUnitLessons) {
      if (!completedLessons[lesson.id]) {
        return lesson.id;
      }
    }

    return null;
  }, [activeUnitId, lessons, completedLessons]);

  const unitToSectionMap = useMemo(() => {
    if (!units) return {};
    return units.reduce((acc, unit) => {
      acc[unit.id] = unit.section;
      return acc;
    }, {} as { [key: string]: number });
  }, [units]);

  useEffect(() => {
    if (units && units.length > 0 && !activeUnit) {
      const firstUnit = units[0];
      const colors = defaultColorSchemes[firstUnit.unit.toString()] || defaultColorSchemes['1'];
      setActiveUnit({ ...firstUnit, ...colors, steps: [] });
    }
  }, [units, activeUnit]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          const topMostUnitId = intersecting[0].target.id;

          // Only update state if the active unit has changed to prevent flickering
          if (activeUnit?.id !== topMostUnitId) {
            const unit = units?.find((u) => u.id === topMostUnitId);
            if (unit) {
              const section = unitToSectionMap[unit.id] || unit.section;
              const colors = defaultColorSchemes[unit.unit.toString()] || defaultColorSchemes['1'];
              setActiveUnit({ ...unit, section, ...colors, steps: [] });
            }
          }
        }
      },
      {
        threshold: 0.1, // A single, small threshold is more stable
        rootMargin: '-80px 0px -75% 0px', // Observe a smaller band at the top of the viewport
      }
    );

    Object.values(unitRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [units, activeUnit, unitToSectionMap]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12" />
      </div>
    )
  }

  if (!units || units.length === 0) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-duo-gray font-bold">No lessons available yet</div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center pb-32 lg:pb-24">
      {/* Sticky Unit Header */}
      <div className={cn(
        "sticky top-0 z-50 w-full px-4 pt-4 md:pt-6 pb-2 md:pb-3 border-b-2 lg:border-none transition-colors",
        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
      )}>
        <div 
          className="rounded-2xl p-3 md:p-4 flex items-center justify-between shadow-lg relative overflow-hidden"
          style={{ 
            backgroundColor: activeUnit?.color || '#58cc02',
            boxShadow: `0 4px 0 0 ${activeUnit?.darkColor || '#46a302'}`
          }}
        >
          <div className="flex flex-col gap-1 relative z-10 pl-2 md:pl-4">
            <div className="flex items-center">
              <h2 
                className="font-black uppercase tracking-widest text-[10px] md:text-sm"
                style={{ color: activeUnit?.lightColor || '#a5e67e' }}
              >
                Section {activeUnit?.section || 1}, Unit {activeUnit?.unit || 1}
              </h2>
            </div>

            <h1 className="text-base md:text-lg font-black text-white">
              {activeUnit?.title || 'Loading...'}
            </h1>
          </div>
        </div>
      </div>

      {units.map((unit, unitIdx) => {
        const colors = defaultColorSchemes[unit.unit.toString()] || defaultColorSchemes['1']
        const unitWithColors = { ...unit, ...colors, steps: [] }
        const unitLessons = lessons?.filter((l: Lesson) => l.unit_id === unit.id) || []

        return (
          <div 
            key={unit.id} 
            id={unit.id}
            ref={(el) => { unitRefs.current[unit.id] = el }}
            className="w-full flex flex-col items-center"
          >
            {/* Path Container */}
            <div className={cn(
              "flex flex-col items-center gap-16 pb-12",
              unitIdx === 0 ? "pt-24 md:pt-28" : "pt-0"
            )}>
              {[0, 1, 2, 3, 4].map((index) => {
                const lesson = unitLessons[index]
                // If there's no lesson at this index, render nothing.
                if (!lesson) return null

                // Lock all lessons that are not in the active unit.
                // For the active unit, use the existing progression logic.
                const isLocked = unit.id !== activeUnitId || (index > 0 && !completedLessons[unitLessons[index - 1]?.id]);
                const isCurrent = lesson.id === firstUncompletedLessonId;


                return (
                  <div 
                    key={index} 
                    className={cn(
                      "relative flex flex-col items-center",
                      // keep class-based translations for zero; use inline style for pixel translations to avoid non-canonical Tailwind classes
                      index === 0 || index === 2 || index === 4 ? 'translate-x-0' : undefined
                    )}
                    style={index === 1 ? { transform: 'translateX(-45px)' } : index === 3 ? { transform: 'translateX(45px)' } : undefined}
                  >
                    {isCurrent && (
                      <div className={cn(
                        "absolute -top-16 z-20 border-2 font-black text-sm px-6 py-3 rounded-xl animate-bounce uppercase tracking-widest whitespace-nowrap shadow-lg",
                        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
                      )}
                        style={{ color: unitWithColors.color }}
                      >
                        {"START"}
                      <div className={cn(
                        "absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 border-r-2 border-b-2 rotate-45 z-[-1]",
                        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
                      )} />
                      </div>
                    )}
                    
                    <div className="relative group">
                      {/* Character Animations */}
                      {unitIdx === 0 && index === 1 && (
                        <div className="absolute left-28 -top-16 w-40 h-40 pointer-events-none z-0" style={{ willChange: 'auto' }}>
                          <CharacterAnimation animationData={characterAnimation1} speed={0.8} />
                        </div>
                      )}
                      {unitIdx === 1 && index === 3 && (
                        <div className="absolute right-32 -top-20 w-44 h-44 pointer-events-none z-0 scale-x-[-1]">
                          <CharacterAnimation animationData={characterAnimation2} />
                        </div>
                      )}
                      {unitIdx === 2 && index === 1 && (
                        <div className="absolute left-28 -top-20 w-44 h-44 pointer-events-none z-0">
                          <CharacterAnimation animationData={characterAnimation3} />
                        </div>
                      )}
                      
                      {/* Shadow/Bottom layer */}
                      <div 
                        className="absolute top-2.5 left-0 w-16 h-14 rounded-[100%]"
                        style={{ backgroundColor: isLocked ? (theme === 'light' ? '#B7B7B7' : '#444') : unitWithColors.darkColor }}
                      />
                      
                      {/* Button Face */}
                      <button 
                        onClick={() => {
                          if (isLocked) return
                          if (profile && profile.hearts === 0) {
                            alert("You have no hearts left. Please refill in the store to continue.");
                            return;
                          }
                          if (lesson.audio_src) {
                            playAudio(lesson.audio_src)
                          }
                          onStartLesson?.(lesson.id)
                        }}
                        disabled={isLocked}
                        className={cn(
                          "w-16 h-14 rounded-[100%] flex items-center justify-center transition-all relative active:translate-y-1 text-white stroke-[4px]",
                          isLocked && "grayscale opacity-50 cursor-not-allowed"
                        )}
                        style={{ 
                          backgroundColor: isLocked ? (theme === 'light' ? '#E5E5E5' : '#888') : unitWithColors.color,
                          boxShadow: `0 4px 0 0 ${isLocked ? (theme === 'light' ? '#B7B7B7' : '#444') : unitWithColors.darkColor}`
                        }}
                      >
                        {lesson && completedLessons[lesson.id] ? <Check className="w-7 h-7" /> :
                         index === 0 ? <Trophy className="w-7 h-7" /> :
                         index === 1 ? <Languages className="w-7 h-7" /> :
                         index === 2 ? <Star className="w-7 h-7" /> :
                         index === 3 ? <Languages className="w-7 h-7" /> :
                         <Trophy className="w-7 h-7" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unit Divider */}
            {unitIdx < units.length - 1 && (
              <UnitDivider title={units[unitIdx + 1].title} />
            )}
          </div>
        )
      })}

      {/* Coming Soon Section */}
      <div className="my-10 md:my-12 text-center">
        <h3 className="text-lg font-bold uppercase tracking-wider text-duo-gray opacity-50">
          Coming Soon!
        </h3>
      </div>

      <audio ref={audioRef} />
    </div>
  )
}