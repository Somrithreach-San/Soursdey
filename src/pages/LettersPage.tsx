import { useState, useEffect, useRef } from 'react'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { Loader } from '../components/ui/Loader'
import { useTheme } from '../contexts'

interface Letter {
  id: string
  char: string
  type: 'CONSONANT' | 'VOWEL' | 'NUMBER'
  order: number
  audio_src: string | null
}

interface LetterCardProps {
  char: string
  audioSrc?: string | null
  onClick?: (audioSrc: string) => void
}

const LetterCard = ({ char, audioSrc, onClick }: LetterCardProps) => {
  const { theme } = useTheme()
  const handleClick = () => {
    if (onClick && audioSrc) {
      onClick(audioSrc)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "w-full aspect-square rounded-2xl border-2 transition-all flex items-center justify-center group relative active:translate-y-1",
        theme === 'light' 
          ? "bg-[#FFFFFF] border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] hover:bg-[#F7F7F7]" 
          : "bg-[#1a232e] border-white/10 shadow-[0_4px_0_0_rgba(255,255,255,0.05)] hover:bg-[#252f3d]"
      )}
    >
      <span className={cn(
        "text-3xl font-black font-khmer",
        theme === 'light' ? "text-[#4B4B4B]" : "text-white"
      )}>{char}</span>
    </button>
  )
}

export const LettersPage = () => {
  const { theme } = useTheme()
  const [letters, setLetters] = useState<Letter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchLetters = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('alphabets')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        console.error('Error fetching letters:', error)
      } else {
        setLetters(data as Letter[])
      }
      setIsLoading(false)
    }

    fetchLetters()
  }, [])

  const handlePlaySound = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const newAudio = new Audio(audioSrc)
    audioRef.current = newAudio

    newAudio.play().catch(error => {
      console.error("Error playing audio:", error)
      if (audioRef.current === newAudio) {
        audioRef.current = null
      }
    })

    newAudio.onended = () => {
      if (audioRef.current === newAudio) {
        audioRef.current = null
      }
    }
  }

  const consonants = letters.filter(l => l.type === 'CONSONANT')
  const vowels = letters.filter(l => l.type === 'VOWEL')
  const numbers = letters.filter(l => l.type === 'NUMBER')

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12" />
      </div>
    )
  }

  return (
    <div className={cn(
      "py-12 px-4 max-w-2xl mx-auto space-y-16 min-h-screen transition-colors duration-300",
      theme === 'light' ? "bg-[#FFFFFF]" : "bg-duo-dark"
    )}>
      {/* Khmer Alphabet Section */}
      <section>
        <div className="mb-10 px-1">
          <h2 className={cn(
            "text-2xl font-black mb-2 tracking-tight uppercase",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>Khmer Alphabet</h2>
          <p className={cn(
            "font-bold text-lg leading-snug",
            theme === 'light' ? "text-[#777777]" : "text-duo-gray"
          )}>
            The sounds that form the foundation of the Khmer language
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
          {consonants.map((item) => (
            <LetterCard 
              key={item.id} 
              char={item.char}
              audioSrc={item.audio_src}
              onClick={handlePlaySound}
            />
          ))}
        </div>
      </section>

      {/* Khmer Vowels Section */}
      <section className={cn(
        "border-t-2 pt-12",
        theme === 'light' ? "border-[#E5E5E5]" : "border-duo-border"
      )}>
        <div className="mb-10 px-1">
          <h2 className={cn(
            "text-2xl font-black mb-2 tracking-tight uppercase",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>Khmer Vowels</h2>
          <p className={cn(
            "font-bold text-lg leading-snug",
            theme === 'light' ? "text-[#777777]" : "text-duo-gray"
          )}>
            Dependent vowels that modify the consonants
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
          {vowels.map((item) => (
            <LetterCard 
              key={item.id} 
              char={item.char}
              audioSrc={item.audio_src}
              onClick={handlePlaySound}
            />
          ))}
        </div>
      </section>

      {/* Khmer Numbers Section */}
      <section className={cn(
        "border-t-2 pt-12",
        theme === 'light' ? "border-[#E5E5E5]" : "border-duo-border"
      )}>
        <div className="mb-10 px-1">
          <h2 className={cn(
            "text-2xl font-black mb-2 tracking-tight uppercase",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>Khmer Numbers</h2>
          <p className={cn(
            "font-bold text-lg leading-snug",
            theme === 'light' ? "text-[#777777]" : "text-duo-gray"
          )}>
            Traditional numerals used in Cambodia
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {numbers.map((item) => (
            <LetterCard 
              key={item.id} 
              char={item.char}
              audioSrc={item.audio_src}
              onClick={handlePlaySound}
            />
          ))}
        </div>
      </section>
    </div>
  )
}