interface LetterCardProps {
  char?: string
  isEmpty?: boolean
}

const LetterCard = ({ char, isEmpty }: LetterCardProps) => {
  if (isEmpty || !char) {
    return (
      <div className="aspect-square rounded-2xl border-[0.5px] border-white/5 bg-white/5 opacity-10" />
    )
  }

  return (
    <button className="aspect-square rounded-2xl border-2 border-white/10 bg-[#1a232e] hover:bg-[#252f3d] transition-all flex flex-col items-center justify-center group relative active:translate-y-[2px] shadow-[0_4px_0_0_rgba(255,255,255,0.05)] active:shadow-none">
      <span className="text-2xl font-black text-white font-khmer">{char}</span>
    </button>
  )
}

export const LettersPage = () => {
  const letters = [
    { char: 'ក' }, { char: 'ខ' }, { char: 'គ' }, { char: 'ឃ' }, { char: 'ង' }, { char: 'ច' },
    { char: 'ឆ' }, { char: 'ជ' }, { char: 'ឈ' }, { char: 'ញ' }, { char: 'ដ' }, { char: 'ឋ' },
    { char: 'ឌ' }, { char: 'ឍ' }, { char: 'ណ' }, { char: 'ត' }, { char: 'ថ' }, { char: 'ទ' },
    { char: 'ធ' }, { char: 'ន' }, { char: 'ប' }, { char: 'ផ' }, { char: 'ព' }, { char: 'ភ' },
    { char: 'ម' }, { char: 'យ' }, { char: 'រ' }, { char: 'ល' }, { char: 'វ' }, { char: 'ស' },
    { char: 'ហ' }, { char: 'ឡ' }, { char: 'អ' },
    { isEmpty: true }, { isEmpty: true }, { isEmpty: true },
  ]

  const vowels = [
    { char: 'ា' }, { char: 'ិ' }, { char: 'ី' }, { char: 'ឹ' }, { char: 'ឺ' }, { char: 'ុ' },
    { char: 'ូ' }, { char: 'ួ' }, { char: 'ើ' }, { char: 'ឿ' }, { char: 'ៀ' }, { char: 'េ' },
    { char: 'ែ' }, { char: 'ៃ' }, { char: 'ោ' }, { char: 'ៅ' }, { char: 'ុំ' }, { char: 'ំ' },
    { char: 'ាំ' }, { char: 'ះ' }, { char: 'ុះ' }, { char: 'េះ' }, { char: 'ោះ' },
    { isEmpty: true },
  ]

  const numbers = [
    { char: '០' }, { char: '១' }, { char: '២' }, { char: '៣' }, { char: '៤' }, { char: '៥' },
    { char: '៦' }, { char: '៧' }, { char: '៨' }, { char: '៩' }, { isEmpty: true }, { isEmpty: true },
  ]

  return (
    <div className="py-12 px-4 max-w-[640px] mx-auto space-y-16">
      {/* Khmer Alphabet Section */}
      <section>
        <div className="mb-8 px-1">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Khmer Alphabet</h2>
          <p className="text-[#9ca3af] font-bold text-lg leading-snug">
            The sounds that form the foundation of the Khmer language
          </p>
        </div>

        <div className="grid grid-cols-6 gap-x-2.5 gap-y-8">
          {letters.map((item, index) => (
            <LetterCard 
              key={index} 
              char={item.char}
              isEmpty={item.isEmpty}
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

        <div className="grid grid-cols-6 gap-x-2.5 gap-y-8">
          {vowels.map((item, index) => (
            <LetterCard 
              key={index} 
              char={item.char}
              isEmpty={item.isEmpty}
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

        <div className="grid grid-cols-6 gap-x-2.5 gap-y-8">
          {numbers.map((item, index) => (
            <LetterCard 
              key={index} 
              char={item.char}
              isEmpty={item.isEmpty}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
