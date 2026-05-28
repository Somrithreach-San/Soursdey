import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Check, Star, Languages, Trophy } from 'lucide-react'
import { useLottie } from 'lottie-react'
import { cn } from '../lib/utils'
import characterAnimation1 from '../assets/peacock.json'
import characterAnimation2 from '../assets/chimpanzee.json'
import characterAnimation3 from '../assets/goat.json'

const units = [
  {
    id: 'unit-1',
    title: 'Name food and drinks',
    section: 1,
    unit: 1,
    color: '#58cc02',
    darkColor: '#46a302',
    lightColor: '#a5e67e',
    steps: [
      { type: 'lesson', icon: Check, active: true, offset: 'translate-x-0', start: true },
      { type: 'lesson', icon: Languages, active: true, offset: 'translate-x-[-45px]' },
      { type: 'lesson', icon: Star, active: true, offset: 'translate-x-0' },
      { type: 'lesson', icon: Languages, active: false, offset: 'translate-x-[45px]' },
      { type: 'final', icon: Trophy, active: false, offset: 'translate-x-0' },
    ]
  },
  {
    id: 'unit-2',
    title: 'Talk about nationalities',
    section: 1,
    unit: 2,
    color: '#ff9600',
    darkColor: '#e68700',
    lightColor: '#ffc800',
    steps: [
      { type: 'lesson', icon: Languages, active: true, offset: 'translate-x-0', start: true },
      { type: 'lesson', icon: Star, active: false, offset: 'translate-x-[-45px]' },
      { type: 'lesson', icon: Languages, active: false, offset: 'translate-x-0' },
      { type: 'lesson', icon: Star, active: false, offset: 'translate-x-[45px]' },
      { type: 'final', icon: Trophy, active: false, offset: 'translate-x-0' },
    ]
  },
  {
    id: 'unit-3',
    title: 'Discuss professions',
    section: 1,
    unit: 3,
    color: '#B68758',
    darkColor: '#966a3e',
    lightColor: '#d4b48d',
    steps: [
      { type: 'lesson', icon: Languages, active: true, offset: 'translate-x-0', start: true },
      { type: 'lesson', icon: Star, active: false, offset: 'translate-x-[-45px]' },
      { type: 'lesson', icon: Languages, active: false, offset: 'translate-x-0' },
      { type: 'lesson', icon: Star, active: false, offset: 'translate-x-[45px]' },
      { type: 'final', icon: Trophy, active: false, offset: 'translate-x-0' },
    ]
  }
]

const UnitDivider = ({ title }: { title: string }) => (
  <div className="w-full flex items-center gap-6 my-24">
    <div className="flex-1 h-[2px] bg-duo-border"></div>
    <span className="text-duo-gray font-bold uppercase tracking-[0.2em] text-sm whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-[2px] bg-duo-border"></div>
  </div>
)

const CharacterAnimation = ({ animationData, speed = 0.5 }: { animationData: unknown, speed?: number }) => {
  const options = {
    animationData,
    loop: true,
    autoplay: true,
  }

  const lottieObj = useLottie(options)

  useEffect(() => {
    lottieObj.setSpeed(speed)
  }, [lottieObj, speed])

  return <div className="w-full h-full">{lottieObj.View}</div>
}

export const LearnPage = ({ onStartLesson }: { onStartLesson?: () => void }) => {
  const [activeUnit, setActiveUnit] = useState(units[0])
  const unitRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the unit that is intersecting with our "focus area" at the top
        const intersecting = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (intersecting.length > 0) {
          const unitId = intersecting[0].target.id
          const unit = units.find(u => u.id === unitId)
          if (unit) {
            setActiveUnit(unit)
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '-80px 0px -80% 0px' // Focus on the top area just below the sticky header
      }
    )

    Object.values(unitRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center pb-24">
      {/* Sticky Unit Header */}
      <div className="sticky top-0 z-50 w-full bg-duo-dark px-4 pt-8 pb-4">
        <div 
          className="rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden"
          style={{ 
            backgroundColor: activeUnit.color,
            boxShadow: `0 4px 0 0 ${activeUnit.darkColor}`
          }}
        >
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <button 
                style={{ color: activeUnit.lightColor }}
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              
              <h2 
                className="font-black uppercase tracking-widest text-[11px]"
                style={{ color: activeUnit.lightColor }}
              >
                Section {activeUnit.section}, Unit {activeUnit.unit}
              </h2>
            </div>

            <h1 className="text-lg font-black text-white ml-7">
              {activeUnit.title}
            </h1>
          </div>
        </div>
      </div>

      {units.map((unit, unitIdx) => (
        <div 
          key={unit.id} 
          id={unit.id}
          ref={(el) => { unitRefs.current[unit.id] = el }}
          className="w-full flex flex-col items-center"
        >
          {/* Path Container */}
          <div className={cn(
            "flex flex-col items-center gap-16 pb-24",
            unitIdx === 0 ? "pt-32" : "pt-16"
          )}>
            {unit.steps.map((step, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative flex flex-col items-center",
                  step.offset
                )}
              >
                {step.start && (
                  <div className="absolute -top-16 z-20 bg-duo-dark border-2 border-duo-border font-black text-sm px-6 py-3 rounded-xl animate-bounce uppercase tracking-widest whitespace-nowrap shadow-lg"
                    style={{ color: unit.color }}
                  >
                    {unitIdx === 0 ? "START" : "Jump Here?"}
                    {/* The Arrow (Perfect triangle using borders) */}
                    <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-duo-dark border-r-2 border-b-2 border-duo-border rotate-45 z-[-1]" />
                  </div>
                )}
                
                <div className="relative group">
                  {/* Unit 1 Lottie Animation */}
                  {unitIdx === 0 && index === 1 && (
                    <div className="absolute left-28 -top-16 w-40 h-40 pointer-events-none z-0">
                      <CharacterAnimation animationData={characterAnimation1} />
                    </div>
                  )}

                  {/* Unit 2 Lottie Animation */}
                  {unitIdx === 1 && index === 3 && (
                    <div className="absolute right-32 -top-20 w-44 h-44 pointer-events-none z-0 scale-x-[-1]">
                      <CharacterAnimation animationData={characterAnimation2} />
                    </div>
                  )}

                  {/* Unit 3 Lottie Animation (Goat) */}
                  {unitIdx === 2 && index === 1 && (
                    <div className="absolute left-28 -top-20 w-44 h-44 pointer-events-none z-0">
                      <CharacterAnimation animationData={characterAnimation3} />
                    </div>
                  )}
                  
                  {/* Shadow/Bottom layer (Oval shape for perspective) */}
                  <div 
                    className={cn(
                      "absolute top-[10px] left-0 w-16 h-[56px] rounded-[100%]",
                      step.active ? "bg-[#46a302]" : "bg-[#2e383d]"
                    )} 
                    style={step.active ? { backgroundColor: unit.darkColor } : {}}
                  />
                  
                  {/* Button Face (Top layer, also oval) */}
                  <button 
                    onClick={() => {
                      if (step.active) onStartLesson?.()
                    }}
                    className={cn(
                      "w-16 h-[56px] rounded-[100%] flex items-center justify-center transition-all relative active:translate-y-[4px]",
                      step.active 
                        ? "text-white"
                        : "bg-duo-border text-duo-gray cursor-not-allowed shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
                    )}
                    style={step.active ? { 
                      backgroundColor: unit.color,
                      boxShadow: `0 4px 0 0 ${unit.darkColor}`
                    } : {}}
                  >
                    {(() => {
                      const Icon = step.icon;
                      return <Icon className={cn(
                        "w-7 h-7",
                        step.active ? "stroke-[4px]" : "opacity-30 stroke-[3px]"
                      )} />;
                    })()}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Unit Divider */}
          {unitIdx < units.length - 1 && (
            <UnitDivider title={units[unitIdx + 1].title} />
          )}
        </div>
      ))}

      {/* Coming Soon Section */}
      <div className="w-full flex flex-col items-center mt-12 pb-24">
        <h3 className="text-xl font-bold text-duo-gray opacity-50 tracking-wide">
          Coming Soon!
        </h3>
      </div>
    </div>
  )
}