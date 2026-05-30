import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Loader } from '../components/ui/Loader'

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
  const handleClick = () => {
    if (onClick && audioSrc) {
      onClick(audioSrc)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className="w-full aspect-square rounded-xl border-2 border-white/10 bg-[#1a232e] hover:bg-[#252f3d] transition-all flex items-center justify-center group relative active:translate-y-0.5 shadow-[0_3px_0_0_rgba(255,255,255,0.05)] active:shadow-none"
    >
      <span className="text-2xl font-black text-white font-khmer">{char}</span>
    </button>
  )
}

export const LettersPage = () => {
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
    <div className="py-12 px-4 max-w-160 mx-auto space-y-16">
      {/* Khmer Alphabet Section */}
      <section>
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Khmer Alphabet</h2>
          <p className="text-[#9ca3af] font-bold text-lg leading-snug">
            The sounds that form the foundation of the Khmer language
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
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
      <section className="border-t-2 border-duo-border pt-12">
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Khmer Vowels</h2>
          <p className="text-[#9ca3af] font-bold text-lg leading-snug">
            Dependent vowels that modify the consonants
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
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
      <section className="border-t-2 border-duo-border pt-12">
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Khmer Numbers</h2>
          <p className="text-[#9ca3af] font-bold text-lg leading-snug">
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