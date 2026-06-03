import { useCountdown } from '../hooks/useCountdown'; // Import the new hook
import { useUser } from '../contexts/UserContext'
import { Clock } from 'lucide-react'
import type { UserQuest } from '../services' // Import the UserQuest type
import { getQuestIcon } from '../lib/getQuestIcon' // Import the centralized function
import diamondIcon from '../assets/diamond.png' // Import the diamond icon

const QuestCard = ({ userQuest, onClaim }: { userQuest: UserQuest, onClaim: (id: string) => void }) => {
  const { quests: quest } = userQuest; // The actual quest details are nested
  const progressPercentage = Math.min((userQuest.progress / quest.target) * 100, 100)
  const isCompleted = userQuest.is_completed;

  return (
    <div className="w-full bg-[#1a232e] border-2 border-white/10 rounded-[20px] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img src={getQuestIcon(quest.icon)} alt={quest.title} className="w-[33px] h-[33px] object-contain" />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1">{quest.title}</h3>
          <p className="text-duo-gray text-sm font-bold">{quest.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <img src={diamondIcon} alt="Gems" className="w-6 h-6 object-contain" />
          <span className="font-black text-duo-yellow uppercase tracking-widest text-sm">{quest.reward}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-duo-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-duo-green rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm font-bold text-duo-gray">{userQuest.progress}/{quest.target}</p>
      </div>

      {isCompleted && (
        <button
          onClick={() => onClaim(userQuest.id)}
          disabled={userQuest.is_claimed}
          className="w-[630px] bg-duo-green text-white font-black text-xs uppercase tracking-widest px-6 py-2 rounded-xl shadow-[0_4px_0_0_#58a700] hover:bg-[#84d823] active:translate-y-0.5 active:shadow-none transition-all disabled:bg-duo-border disabled:shadow-none disabled:cursor-not-allowed mx-auto"
        >
          {userQuest.is_claimed ? 'Claimed' : 'Claim Reward'}
        </button>
      )}
    </div>
  )
}


export default function QuestsPage() {
  const { quests, claimUserQuestReward } = useUser()

  const getMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return midnight.getTime();
  }

  const [hours, minutes, seconds] = useCountdown(getMidnight());

  const timeRemaining = `${hours}h ${minutes}m ${seconds}s remaining`;

  return (
    <div className="py-12 px-4 max-w-160 mx-auto">
      <section className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Daily Quests</h2>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-duo-gray" />
            <span className="text-sm font-bold text-duo-gray uppercase">{timeRemaining}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {quests.map((userQuest) => (
            <QuestCard key={userQuest.id} userQuest={userQuest} onClaim={claimUserQuestReward} />
          ))}
        </div>
      </section>
    </div>
  )
}