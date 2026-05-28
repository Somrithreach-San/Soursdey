import { Zap } from 'lucide-react'
import { Button } from '../ui/Button'
import diamond from '../../assets/diamond.png'
import hearts from '../../assets/hearts.png'
import streak from '../../assets/streak.png'
import subscription from '../../assets/subscription.png'

export const RightSidebar = ({ onStoreClick }: { onStoreClick?: () => void }) => {
  return (
    <div className="w-80 pt-8 px-4 pb-8 sticky top-0 h-screen overflow-y-auto">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-2 mb-8 px-1">
        <div className="flex items-center gap-1.5 justify-center">
          <img src={streak} alt="Streak" className="w-6 h-6 flex-shrink-0 object-contain" />
          <span className="font-bold text-base text-duo-orange">6</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <img src={diamond} alt="Diamond" className="w-6 h-6 flex-shrink-0 object-contain" />
          <span className="font-bold text-base text-duo-blue">582</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <img src={hearts} alt="Hearts" className="w-6 h-6 flex-shrink-0 object-contain" />
          <span className="font-bold text-base text-duo-red">5</span>
        </div>
      </div>

      {/* Pro Card */}
      <div className="bg-duo-dark border-[0.5px] border-duo-border rounded-xl p-5 mb-6">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-duo-green text-xs font-black px-2 py-1 rounded-md uppercase text-white">
            PRO
          </div>
          <div className="w-10 h-10 flex items-center justify-center">
             <img src={subscription} alt="Pro" className="w-8 h-8 object-contain" />
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1.5 text-white">Try Pro for free</h3>
        <p className="text-duo-gray text-sm leading-snug mb-4">
          No ads, personalized practice, and unlimited Legendary!
        </p>
        <Button 
          variant="primary" 
          fullWidth 
          className="py-2.5 text-xs"
          onClick={onStoreClick}
        >
          TRY 1 WEEKS FREE
        </Button>
      </div>

      {/* Daily Quests Card */}
      <div className="bg-duo-dark border-[0.5px] border-duo-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base text-white uppercase tracking-wider">Daily Quests</h3>
          <button className="text-[11px] font-black text-duo-green uppercase tracking-widest">VIEW ALL</button>
        </div>
        
        <div className="flex items-start gap-3 mb-4">
          <Zap className="w-7 h-7 text-duo-green fill-duo-green mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-white mb-1.5">Earn 50 XP</h4>
            <div className="h-3 bg-duo-border rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-duo-green rounded-full relative">
                <div className="absolute top-0 right-0 h-full w-2 bg-white/20" />
              </div>
            </div>
          </div>
          <div className="text-xl mt-2">🎁</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-3 text-xs font-bold text-duo-gray uppercase tracking-wider opacity-60">
        <div className="flex flex-wrap justify-center gap-x-4">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
          <a href="#" className="hover:text-white transition-colors">Store</a>
          <a href="#" className="hover:text-white transition-colors">Efficacy</a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4">
          <a href="#" className="hover:text-white transition-colors">Investors</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </div>
    </div>
  )
}
