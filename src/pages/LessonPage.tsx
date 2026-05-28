import { useState } from 'react'
import { X, Settings, Infinity as InfinityIcon, CheckCircle2, Flag } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import hearts from '../assets/hearts.png'
import jason from '../assets/Jason.png'

interface Option {
  id: number
  text: string
  phonetic: string
  isCorrect?: boolean
}

const options: Option[] = [
  {
    id: 1,
    text: 'កាហ្វេ',
    phonetic: 'ka fey'
  },
  {
    id: 2,
    text: 'បាយ',
    phonetic: 'bay',
    isCorrect: true
  },
  {
    id: 3,
    text: 'តែ',
    phonetic: 'tae'
  }
]

export const LessonPage = ({ onExit }: { onExit: () => void }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [progress] = useState(40)

  const handleCheck = () => {
    if (!selectedOption) return
    const option = options.find(o => o.id === selectedOption)
    if (option?.isCorrect) {
      setStatus('correct')
    } else {
      setStatus('wrong')
    }
  }

  const handleContinue = () => {
    setStatus('idle')
    setSelectedOption(null)
  }

  return (
    <div className="fixed inset-0 bg-duo-dark z-[100] flex flex-col h-screen select-none">
      {/* Header */}
      <header className="max-w-5xl mx-auto w-full px-4 pt-10 pb-4 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="text-duo-gray hover:text-white transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2.5} />
          </button>
          
          <button className="text-duo-gray hover:text-white transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 h-4 bg-duo-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-duo-green transition-all duration-700 relative rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img src={hearts} alt="Hearts" className="w-7 h-7 object-contain" />
          <InfinityIcon className="w-5 h-5 text-duo-blue" strokeWidth={3} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-16 px-4 max-w-xl mx-auto w-full">
        <div className="w-full mb-10">
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-8">
            Select the correct meaning
          </h1>

          {/* Character and Speech Bubble */}
          <div className="flex items-end gap-4 mb-10">
            <div className="w-24 h-24 relative">
               <img src={jason} alt="Character" className="w-full h-full object-contain" />
            </div>
            
            <div className="relative mb-6">
              <div className="bg-transparent border-2 border-duo-border rounded-xl px-5 py-2.5 relative">
                <span className="text-white font-bold text-base">rice</span>
                {/* Speech bubble tail */}
                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-duo-border border-b-[6px] border-b-transparent">
                  <div className="absolute left-[2px] top-[-4px] w-0 h-0 border-t-[4px] border-t-transparent border-r-[8px] border-r-duo-dark border-b-[4px] border-b-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Options */}
        <div className="flex flex-col gap-2.5 w-full">
          {options.map((option) => {
            const isSelected = selectedOption === option.id
            const isCorrect = status === 'correct' && isSelected
            const isWrong = status === 'wrong' && isSelected

            return (
              <button
                key={option.id}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "flex items-center px-4 py-3 border-2 rounded-xl transition-all group relative active:translate-y-[2px] active:shadow-none min-h-[64px] bg-duo-dark",
                  isSelected && status === 'idle' && "border-duo-green shadow-[0_3px_0_0_#58cc02]",
                  !isSelected && status === 'idle' && "border-duo-border shadow-[0_3px_0_0_#37464f] hover:bg-white/5",
                  isCorrect && "border-duo-green bg-duo-green/10 shadow-none",
                  isWrong && "border-[#ff4b4b] bg-[#ff4b4b]/10 shadow-none",
                  status !== 'idle' && !isSelected && "opacity-50"
                )}
              >
                {/* Number indicator */}
                <div className={cn(
                  "w-6 h-6 border-2 rounded-lg flex items-center justify-center text-[11px] font-black mr-4 flex-shrink-0 transition-colors",
                  isSelected && status === 'idle' && "border-duo-green text-duo-green",
                  !isSelected && status === 'idle' && "border-duo-border text-duo-gray",
                  isCorrect && "border-duo-green text-duo-green",
                  isWrong && "border-[#ff4b4b] text-[#ff4b4b]"
                )}>
                  {option.id}
                </div>

                {/* Text content */}
                <div className="flex-1 flex flex-col items-center pr-10">
                  <span className={cn(
                    "text-[13px] font-bold transition-colors leading-none mb-1",
                    isSelected && status === 'idle' && "text-duo-green",
                    !isSelected && status === 'idle' && "text-duo-gray",
                    isCorrect && "text-duo-green",
                    isWrong && "text-[#ff4b4b]"
                  )}>
                    {option.phonetic}
                  </span>
                  <span className={cn(
                    "text-xl font-black font-khmer transition-colors leading-tight",
                    isSelected && status === 'idle' && "text-duo-green",
                    !isSelected && status === 'idle' && "text-white",
                    isCorrect && "text-duo-green",
                    isWrong && "text-[#ff4b4b]"
                  )}>
                    {option.text}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "border-t-2 py-8 px-4 transition-colors duration-300 border-duo-border bg-duo-dark",
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {status === 'idle' ? (
              <Button 
                variant="ghost" 
                className="px-12"
                onClick={onExit}
              >
                Skip
              </Button>
            ) : (
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#202f36]">
                  {status === 'correct' ? (
                    <CheckCircle2 className="w-10 h-10 text-duo-green" fill="currentColor" stroke="#202f36" />
                  ) : (
                    <X className="w-10 h-10 text-[#ff4b4b]" strokeWidth={4} />
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className={cn(
                    "text-2xl font-black",
                    status === 'correct' ? "text-duo-green" : "text-[#ff4b4b]"
                  )}>
                    {status === 'correct' ? 'Amazing!' : 'Correct solution:'}
                  </h2>
                  
                  {status === 'wrong' && (
                    <div className="flex flex-col mb-1">
                      <span className="text-[#ff4b4b] font-bold text-sm">
                        {options.find(o => o.isCorrect)?.phonetic}
                      </span>
                      <span className="text-[#ff4b4b] font-black text-lg font-khmer">
                        {options.find(o => o.isCorrect)?.text}
                      </span>
                    </div>
                  )}

                  <button className={cn(
                    "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mt-1",
                    status === 'correct' ? "text-duo-green/70" : "text-[#ff4b4b]/70"
                  )}>
                    <Flag className="w-4 h-4" />
                    REPORT
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant={status === 'correct' ? "primary" : status === 'wrong' ? "danger" : (selectedOption ? "primary" : "ghost")}
            disabled={!selectedOption && status === 'idle'}
            className={cn(
              "px-12 min-w-[200px] uppercase tracking-wider font-black",
              !selectedOption && status === 'idle' && "opacity-50 grayscale"
            )}
            onClick={status === 'idle' ? handleCheck : handleContinue}
          >
            {status === 'idle' ? 'Check' : 'Continue'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
