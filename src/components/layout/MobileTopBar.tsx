import { useState, useRef, useEffect } from 'react'
import { Infinity as InfinityIcon } from 'lucide-react'
import diamond from '../../assets/diamond.png'
import hearts from '../../assets/hearts.png'
import streak from '../../assets/streak.png'
import gearIcon from '../../assets/gear_icon.png'
import moreIcon from '../../assets/more_icon.png'
import storeIcon from '../../assets/store.png'
import { useTheme } from '../../contexts'
import { cn } from '../../lib/utils'

interface MobileTopBarProps {
  profile: any
  onSettingsClick?: () => void
  onShopClick?: () => void
  onHeartClick?: () => void
}

export const MobileTopBar = ({ profile, onSettingsClick, onShopClick, onHeartClick }: MobileTopBarProps) => {
  const { theme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Dark Overlay */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[25] transition-opacity duration-300"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      <div className={cn(
        "lg:hidden shrink-0 w-full transition-colors z-30 sticky top-0",
        theme === 'light' ? "bg-white" : "bg-duo-dark"
      )} ref={dropdownRef}>
        <div className="flex items-center justify-between px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={streak} alt="Streak" className="w-6 h-6 shrink-0 object-contain" />
              <span className="font-black text-base text-duo-orange">
                {profile?.streak ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img src={diamond} alt="Diamond" className="w-6 h-6 shrink-0 object-contain" />
              <span className="font-black text-base text-duo-blue">
                {profile?.diamonds ?? 0}
              </span>
            </div>
            <button 
              onClick={onHeartClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={hearts} alt="Hearts" className="w-6 h-6 shrink-0 object-contain" />
              <span className={cn(
                "font-black text-base",
                profile?.is_subscribed ? "text-duo-blue" : (theme === 'light' ? "text-[#FF4B4B]" : "text-duo-red")
              )}>
                {profile?.is_subscribed ? (
                  <InfinityIcon className="w-5 h-5" strokeWidth={3} />
                ) : (
                  profile?.hearts ?? 5
                )}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "p-1.5 rounded-xl transition-all relative group",
                isDropdownOpen && (theme === 'light' ? "bg-[#F7F7F7]" : "bg-white/5")
              )}
            >
              <img 
                src={moreIcon} 
                alt="More" 
                className="w-7 h-7 object-contain"
              />
            </button>
          </div>
        </div>

        {/* Dropdown Menu Expansion */}
        {isDropdownOpen && (
          <div className="w-full px-6 pb-4 flex flex-col items-center">
             {/* Caret pointing up */}
             <div className="w-full flex justify-end pr-3.5 -mt-1 mb-2">
                <div className={cn(
                  "w-3 h-3 border-l-2 border-t-2 rotate-45",
                  theme === 'light' ? "border-[#E5E5E5]" : "border-[#37464f]"
                )} />
             </div>
             
             <button 
                onClick={() => {
                  onShopClick?.()
                  setIsDropdownOpen(false)
                }}
                className={cn(
                  "w-full py-2 flex items-center gap-3 transition-colors px-2 rounded-xl",
                  theme === 'light' ? "hover:bg-[#F7F7F7]" : "hover:bg-white/5"
                )}
              >
                <img src={storeIcon} alt="Shop" className="w-5 h-5 object-contain" />
                <span className={cn(
                  "font-black uppercase tracking-widest text-sm",
                  theme === 'light' ? "text-[#4B4B4B]" : "text-white"
                )}>Shop</span>
              </button>
             <button 
                onClick={() => {
                  onSettingsClick?.()
                  setIsDropdownOpen(false)
                }}
                className={cn(
                  "w-full py-2 flex items-center gap-3 transition-colors px-2 rounded-xl",
                  theme === 'light' ? "hover:bg-[#F7F7F7]" : "hover:bg-white/5"
                )}
              >
                <img src={gearIcon} alt="Settings" className="w-5 h-5 object-contain" />
                <span className={cn(
                  "font-black uppercase tracking-widest text-sm",
                  theme === 'light' ? "text-[#4B4B4B]" : "text-white"
                )}>Settings</span>
              </button>
          </div>
        )}
      </div>
    </>
  )
}
