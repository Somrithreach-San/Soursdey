import { useEffect, useState } from 'react'
import { useUser, useTheme } from '../contexts'
import { cn } from '../lib/utils'
import { getLeaderboardProfiles, type Profile } from '../services'
import { Loader } from '../components/ui/Loader'

// Import all possible avatars
import jason from '../assets/Jason.png'
import lily from '../assets/Lily.png'
import linda from '../assets/Linda.png'
import mark from '../assets/Mark.png'
import marry from '../assets/Marry.png'
import diamondIcon from '../assets/diamond.png'
import rank1Icon from '../assets/rank1.png'
import rank2Icon from '../assets/rank2.png'
import rank3Icon from '../assets/rank3.png'

// A helper function to map avatar filenames to imported images
const getAvatar = (avatarUrl: string | undefined) => {
  if (!avatarUrl) return lily;
  switch (avatarUrl) {
    case 'Jason.png': return jason;
    case 'Lily.png': return lily;
    case 'Linda.png': return linda;
    case 'Mark.png': return mark;
    case 'Marry.png': return marry;
    default:
      return avatarUrl;
  }
};

const LeaderboardPage = () => {
  const { profile } = useUser()
  const { theme } = useTheme()
  const [leaderboardData, setLeaderboardData] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculate days remaining until Sunday midnight
  const getDaysRemaining = () => {
    const now = new Date()
    const nextSunday = new Date(now)
    // Find next Sunday (day 0). If today is Sunday, we want the NEXT Sunday.
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7
    nextSunday.setDate(now.getDate() + daysUntilSunday)
    nextSunday.setHours(0, 0, 0, 0)
    
    const diffTime = nextSunday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      const data = await getLeaderboardProfiles()
      setLeaderboardData(data)
      setIsLoading(false)
    }

    fetchLeaderboard()
  }, [])

  // Assign rank based on current sort
   const rankedData = [...leaderboardData]
   
   // Ensure current user is in the list even if fetch returned nothing or they are missing
   if (profile && !rankedData.find(u => u.id === profile.id)) {
     rankedData.push(profile)
   }

  // Final sort by XP (or diamonds as fallback) and rank assignment
  const finalData = rankedData
    .sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.diamonds || 0) - (a.diamonds || 0))
    .map((user, index) => ({ 
      ...user as Profile & { rank: number }, 
      rank: index + 1 
    }))

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative flex items-center justify-center w-10 h-10">
            <img src={rank1Icon} alt="Rank 1" className="w-8 h-8 object-contain" />
          </div>
        )
      case 2:
        return (
          <div className="relative flex items-center justify-center w-10 h-10">
            <img src={rank2Icon} alt="Rank 2" className="w-8 h-8 object-contain" />
          </div>
        )
      case 3:
        return (
          <div className="relative flex items-center justify-center w-10 h-10">
            <img src={rank3Icon} alt="Rank 3" className="w-8 h-8 object-contain" />
          </div>
        )
      default:
        return <span className={cn("font-black text-base w-10 text-center", theme === 'light' ? "text-[#4b4b4b]" : "text-[#afafaf]")}>{rank}</span>
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] lg:h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className={cn(
        "shrink-0 pt-8 pb-6 px-4 flex flex-col items-center transition-colors",
        theme === 'light' ? "bg-white" : "bg-duo-dark"
      )}>
        <h1 className={cn(
          "text-3xl font-black uppercase tracking-tight mb-4",
          theme === 'light' ? "text-[#4b4b4b]" : "text-white"
        )}>Leaderboard</h1>
        
        <div className="flex items-center justify-center gap-2 flex-wrap px-4 mb-2">
          <p className={cn("font-bold text-base text-center", theme === 'light' ? "text-[#777777]" : "text-[#afafaf]")}>
            Top <span className={cn("font-black text-[22px]", theme === 'light' ? "text-[#4b4b4b]" : "text-white")}>3</span> learners will receive
          </p>
          <div className="flex items-center gap-1.5">
            <img src={diamondIcon} alt="Diamond" className="w-5 h-5 object-contain" />
            <span className="text-duo-blue font-black text-xl">1,000</span>
          </div>
          <p className={cn("font-bold text-base text-center", theme === 'light' ? "text-[#777777]" : "text-[#afafaf]")}>
            each by the end of the week
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-[#FFC700] font-bold text-base whitespace-nowrap">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide">
        <div className="w-full max-w-xl mx-auto pt-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader className={cn("w-8 h-8", theme === 'light' ? "text-[#4b4b4b]" : "text-white")} />
            </div>
          ) : (
            <div className="space-y-2">
              {finalData.map((user) => (
                <div 
                  key={user.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl transition-colors",
                    profile?.id === user.id 
                      ? (theme === 'light' ? "bg-[#E5E5E5]/50" : "bg-white/5")
                      : (theme === 'light' ? "hover:bg-[#F7F7F7]" : "hover:bg-white/5")
                  )}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 flex justify-center w-12">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden border-2",
                      theme === 'light' ? "border-[#E5E5E5]" : "border-duo-border"
                    )}>
                      <img 
                        src={getAvatar(user.avatar_url)} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Name & XP */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold truncate",
                          theme === 'light' ? "text-[#4b4b4b]" : "text-white"
                        )}>
                          {user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-black whitespace-nowrap",
                          theme === 'light' ? "text-[#777777]" : "text-[#afafaf]"
                        )}>
                          {user.xp || 0}
                        </span>
                        <span className={cn(
                          "font-bold text-sm uppercase",
                          theme === 'light' ? "text-[#777777]" : "text-[#afafaf]"
                        )}>XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage

