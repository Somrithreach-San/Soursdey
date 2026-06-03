import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '../../lib/utils'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    // Increased threshold to 1200px so it appears later
    if (window.pageYOffset > 1200) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <div className={cn(
      "fixed bottom-24 lg:bottom-12 right-6 lg:right-[calc(50%-260px)] z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
      isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-75 pointer-events-none"
    )}>
      <button
        onClick={scrollToTop}
        className="bg-duo-green hover:bg-[#61e002] text-white p-3 rounded-xl shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 stroke-[3px]" />
      </button>
    </div>
  )
}
