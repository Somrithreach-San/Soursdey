'use client'

import { Button } from '../ui/Button'
import { Infinity as InfinityIcon } from 'lucide-react'
import diamond from '../../assets/diamond.png'
import hearts from '../../assets/hearts.png'
import streak from '../../assets/streak.png'
import { useUser, useTheme } from '../../contexts'
import { MAX_HEARTS } from '../../lib/hearts'
import subscription from '../../assets/subscription.png'
import { getQuestIcon } from '../../lib/getQuestIcon' // Import the centralized function
import { cn, getDaysRemaining } from '../../lib/utils'

export const RightSidebar = ({ 
  userProfile, 
  onStoreClick, 
  onQuestsClick, 
  hideQuests,
  onHeartClick
}: { 
  userProfile: any, 
  onStoreClick?: () => void, 
  onQuestsClick?: () => void, 
  hideQuests?: boolean,
  onHeartClick?: () => void
}) => {
  const { quests } = useUser()
  const { theme } = useTheme()
  const daysRemaining = getDaysRemaining(userProfile?.subscription_end_at)

  return (
    <div className="w-80 pt-8 px-4 pb-8 sticky top-0 h-screen overflow-y-auto">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-2 mb-8 px-1">
        <div className="flex items-center gap-1.5 justify-center">
          <img src={streak} alt="Streak" className="w-6 h-6 shrink-0 object-contain" />
          <span className="font-bold text-base text-duo-orange">
            {userProfile?.streak ?? 0}
          </span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <img src={diamond} alt="Diamond" className="w-6 h-6 shrink-0 object-contain" />
          <span className="font-bold text-base text-duo-blue">
            {userProfile?.diamonds ?? 0}
          </span>
        </div>
        <button 
          onClick={onHeartClick}
          className="flex items-center gap-1.5 justify-center hover:opacity-80 transition-opacity"
        >
          <img src={hearts} alt="Hearts" className="w-6 h-6 shrink-0 object-contain" />
          <span className={cn(
            "font-bold text-base",
            userProfile?.is_subscribed ? "text-duo-blue" : (theme === 'light' ? "text-[#FF4B4B]" : "text-duo-red")
          )}>
            {userProfile?.is_subscribed ? (
              <InfinityIcon className="w-5 h-5" strokeWidth={3} />
            ) : (
              `${userProfile?.hearts ?? 5}/${MAX_HEARTS}`
            )}
          </span>
        </button>
      </div>

      {/* Pro Card */}
      {!userProfile?.is_subscribed ? (
        <div className={cn(
          "border-[0.5px] rounded-xl p-5 mb-6",
          theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
        )}>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-duo-green text-xs font-black px-2 py-1 rounded-md uppercase text-white shadow-[0_2px_0_0_#46a302]">
              PRO
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
               <img src={subscription} alt="Pro" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <h3 className={cn(
            "font-bold text-lg mb-1.5",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>Try Pro for free</h3>
          <p className="text-duo-gray text-sm leading-snug mb-4">
            No ads, personalized practice, and unlimited Legendary!
          </p>
          <Button 
            variant="primary" 
            fullWidth 
            className="py-2.5 text-xs"
            onClick={onStoreClick}
          >
            TRY 1 WEEK FREE
          </Button>
        </div>
      ) : (
        <div className={cn(
          "border-[0.5px] rounded-xl p-5 mb-6",
          theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
        )}>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-duo-green text-xs font-black px-2 py-1 rounded-md uppercase text-white shadow-[0_2px_0_0_#46a302]">
              PRO
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
               <img src={subscription} alt="Pro" className="w-8 h-8 object-contain" />
            </div>
          </div>
          <h3 className={cn(
            "font-bold text-lg mb-1.5 tracking-tight",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>
            {userProfile?.subscription_status === 'trialing' ? 'Soursdey Pro Trial' : 'Soursdey Pro Active'}
          </h3>
          <p className="text-duo-gray text-sm leading-snug mb-4">
            {userProfile?.subscription_status === 'trialing' 
              ? `Your free trial is active! ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`
              : 'Enjoy your premium features! No ads and unlimited practice.'}
          </p>
          <Button 
            variant="ghost" 
            fullWidth 
            className={cn(
              "py-2.5 text-xs border-none disabled:opacity-50 disabled:cursor-not-allowed",
              theme === 'light'
                ? "bg-[#E5E5E5] text-[#afafaf] shadow-[0_3px_0_0_#afafaf]"
                : "bg-duo-gray/20 text-white shadow-[0_3px_0_0_#37464f] enabled:hover:bg-duo-gray/30"
            )}
            onClick={onStoreClick}
            disabled={true}
          >
            {userProfile?.subscription_status === 'trialing' ? 'TRIAL ACTIVE' : 'SUBSCRIBED'}
          </Button>
        </div>
      )}

      {/* Daily Quests Card - Now displays all quests */}
      {!hideQuests && quests && quests.length > 0 && (
        <div className={cn(
          "border-[0.5px] rounded-xl p-5",
          theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-duo-dark border-duo-border"
        )}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={cn(
              "font-bold text-base uppercase tracking-wider",
              theme === 'light' ? "text-[#4B4B4B]" : "text-white"
            )}>Daily Quests</h3>
            <button 
              onClick={onQuestsClick}
              className="text-[11px] font-black text-duo-green uppercase tracking-widest"
            >
              DETAILS
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {quests.map(quest => {
              const progressPercentage = Math.min((quest.progress / quest.quests.target) * 100, 100);
              return (
                <div key={quest.id} className="flex items-start gap-3">
                  <img src={getQuestIcon(quest.quests.icon)} alt={quest.quests.title} className="w-7 h-7 object-contain" />
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-bold text-sm mb-1.5",
                      theme === 'light' ? "text-[#4B4B4B]" : "text-white"
                    )}>{quest.quests.title}</h4>
                    <div className={cn(
                      "h-3 rounded-full overflow-hidden",
                      theme === 'light' ? "bg-[#E5E5E5]" : "bg-duo-border"
                    )}>
                      <div 
                        className="h-full bg-duo-green rounded-full relative transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute top-0 right-0 h-full w-2 bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-3 text-xs font-bold text-duo-gray uppercase tracking-wider opacity-60">
        <div className="flex flex-wrap justify-center gap-x-4">
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>About</a>
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Blog</a>
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Store</a>
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Efficacy</a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4">
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Investors</a>
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Terms</a>
          <a href="#" className={cn("transition-colors", theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white")}>Privacy</a>
        </div>
      </div>
    </div>
  )
}