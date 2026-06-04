import { useState, useEffect, type FC } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts'
import { Button } from '../ui/Button'
import { ImageWithLoader } from '../ui/ImageWithLoader'
import { getTimeUntilNextHeart, MAX_HEARTS } from '../../lib/hearts'
import heartsAsset from '../../assets/hearts.png'

interface HeartStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onShopClick: () => void
  profile: {
    hearts: number
    is_subscribed: boolean
    last_heart_update: string | Date
  } | null
}

export const HeartStatusModal: FC<HeartStatusModalProps> = ({ isOpen, onClose, onShopClick, profile }) => {
  const { theme } = useTheme()
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Disable background scroll
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    let interval: ReturnType<typeof setInterval> | null = null

    if (profile && !profile.is_subscribed && profile.hearts < MAX_HEARTS) {
      const updateTimer = () => {
        const time = getTimeUntilNextHeart(profile.hearts, profile.last_heart_update)
        setTimeLeft(time)
      }

      updateTimer()
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      document.body.style.overflow = originalStyle
      if (interval) clearInterval(interval)
    }
  }, [isOpen, profile?.hearts, profile?.is_subscribed, profile?.last_heart_update])

  if (!isOpen) return null

  const isFull = profile?.hearts >= MAX_HEARTS
  const isSubscribed = profile?.is_subscribed
  const isEmpty = profile?.hearts === 0

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className={cn(
          "border-2 rounded-3xl p-6 max-w-[320px] w-full relative text-center flex flex-col items-center gap-5",
          theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-[#1a232e] border-white/10"
        )} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className={cn(
            "absolute top-3 right-3 p-1 rounded-lg transition-colors",
            theme === 'light' ? "hover:bg-gray-100 text-gray-400" : "hover:bg-white/5 text-duo-gray"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <ImageWithLoader 
            src={heartsAsset} 
            alt="Hearts" 
            className="w-20 h-20"
            imgClassName="object-contain"
          />
        </div>

        <div className="space-y-1">
          <h2 className={cn(
            "text-xl font-black",
            theme === 'light' ? "text-[#4b4b4b]" : "text-white"
          )}>
            {isSubscribed ? "Unlimited Hearts" : isFull ? "Full Hearts" : isEmpty ? "You're out of hearts!" : "Hearts"}
          </h2>
          <p className="text-duo-gray font-bold text-sm">
            {isSubscribed 
              ? "You have unlimited hearts with Soursdey Pro!" 
              : isFull 
                ? "Your hearts are full! Go start a lesson." 
                : isEmpty 
                  ? "You need hearts to start lessons." 
                  : `You have ${profile?.hearts}/${MAX_HEARTS} hearts.`}
          </p>
        </div>

        {!isSubscribed && !isFull && (
          <div className={cn(
            "w-full p-3 rounded-2xl border-2 flex flex-col items-center gap-1",
            theme === 'light' ? "bg-[#F7F7F7] border-[#E5E5E5]" : "bg-white/5 border-white/10"
          )}>
            <span className="text-duo-gray font-bold uppercase tracking-wider text-[10px]">Next heart in</span>
            <span className={cn(
              "text-xl font-black",
              theme === 'light' ? "text-[#4b4b4b]" : "text-white"
            )}>
              {timeLeft ? `${timeLeft.minutes}:${timeLeft.seconds.toString().padStart(2, '0')}` : "--:--"}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {!isFull && !isSubscribed ? (
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full py-3 text-sm"
              onClick={() => {
                onShopClick()
                onClose()
              }}
            >
              Refill in Shop
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full py-3 text-sm"
              onClick={onClose}
            >
              OK
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
