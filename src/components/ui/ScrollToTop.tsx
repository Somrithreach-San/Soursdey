import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '../../lib/utils'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when page is scrolled down
  const toggleVisibility = (event?: any) => {
    // Check multiple scroll detection methods
    let scrollTop = 0;
    
    if (event && event.target instanceof HTMLElement) {
      scrollTop = event.target.scrollTop;
    } else {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    }
    
    // Increased threshold to 400px so it appears later
    if (scrollTop > 400) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    const scrollOptions: ScrollToOptions = {
      top: 0,
      behavior: 'smooth',
    };
    
    // Scroll window
    window.scrollTo(scrollOptions);
    document.documentElement.scrollTo(scrollOptions);
    document.body.scrollTo(scrollOptions);
    
    // Also try to scroll all common scroll containers
    const containers = document.querySelectorAll('.overflow-y-auto, [ref="scrollContainerRef"]');
    containers.forEach(container => {
      container.scrollTo(scrollOptions);
    });
  }

  useEffect(() => {
    // Use capture: true to catch scroll events from internal containers
    window.addEventListener('scroll', toggleVisibility, true)
    return () => {
      window.removeEventListener('scroll', toggleVisibility, true)
    }
  }, [])

  return (
    <div className={cn(
      "fixed bottom-28 lg:bottom-10 right-8 lg:right-[calc(50%-260px)] xl:right-[calc(50%-380px)] 2xl:right-[calc(50%-380px)] z-[9999] transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-50 pointer-events-none"
    )}>
      <button
        onClick={scrollToTop}
        className="bg-duo-green hover:bg-[#61e002] text-white p-3 rounded-xl border-b-4 border-[#46a302] shadow-xl transition-all flex items-center justify-center group active:translate-y-1 active:border-b-0"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 stroke-[4px] group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  )
}
