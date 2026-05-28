import { Repeat } from 'lucide-react'
import Lottie from 'lottie-react'
import oxData from '../assets/ox.json'

// Fix for Lottie default import issues in some environments
const LottiePlayer = (Lottie as unknown as { default: typeof Lottie }).default || Lottie;

interface PracticeCardProps {
  title: string
  description: string
  icon: React.ElementType
  iconColor: string
  badge?: string
  onClick?: () => void
}

const PracticeCard = ({ title, description, icon: Icon, iconColor, badge, onClick }: PracticeCardProps) => (
  <button 
    onClick={onClick}
    className="w-full bg-[#1a232e] border-2 border-white/10 rounded-[20px] flex items-stretch overflow-hidden hover:bg-[#252f3d] transition-all group active:translate-y-[2px] relative shadow-[0_4px_0_0_rgba(255,255,255,0.05)] active:shadow-none"
  >
    <div className="flex-1 p-6 text-left flex flex-col justify-center">
      <h3 className="font-bold text-xl text-white mb-1.5">{title}</h3>
      <p className="text-duo-gray text-base font-bold leading-snug">{description}</p>
    </div>

    <div className="w-24 flex items-center justify-center pr-6">
      <div className={`w-14 h-14 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-[0_4px_0_0_rgba(255,255,255,0.1)] ${iconColor} active:translate-y-[2px] active:shadow-none transition-all relative`}>
        <Icon className="w-8 h-8 text-white" />
        {badge && (
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-duo-orange text-white text-[12px] font-black flex items-center justify-center rounded-full shadow-lg">
            {badge}
          </div>
        )}
      </div>
    </div>
  </button>
)

export const PracticePage = () => {
  return (
    <div className="py-12 px-4 max-w-[640px] mx-auto">
      {/* Today's Review Section */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-white mb-5 tracking-tight uppercase">Today's Review</h2>
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-duo-green to-duo-dark-green p-8 min-h-[200px] flex flex-col justify-between group">
          <div className="relative z-10 max-w-[65%]">
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Unit Review</h3>
            <p className="text-white/90 font-bold text-base leading-snug mb-6">
              Recall what you've learned in this unit and earn extra XP!
            </p>
            <button className="bg-white text-duo-green font-black text-sm uppercase tracking-widest px-8 py-3 rounded-xl shadow-[0_4px_0_0_#e5e5e5] hover:bg-gray-50 active:translate-y-[2px] active:shadow-none transition-all">
              START 20 XP
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-[35%] h-full flex items-end justify-end p-4">
             <div className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500">
               <LottiePlayer animationData={oxData} loop={true} />
             </div>
          </div>
        </div>
      </section>

      {/* Your Collections Section */}
      <section className="mb-12">
        <h2 className="text-xl font-black text-white mb-5 tracking-tight uppercase">Correct your mistakes</h2>
        <div className="space-y-4">
          <PracticeCard 
            title="Mistakes"
            description="Start a personalized lesson to practice your mistakes"
            icon={Repeat}
            iconColor="bg-duo-green"
            badge="6"
          />
        </div>
      </section>
    </div>
  )
}
