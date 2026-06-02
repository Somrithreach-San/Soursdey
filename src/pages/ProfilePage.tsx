import { useState, type FC } from 'react'
import { Clock, Pencil, AlertTriangle, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import streakAsset from '../assets/streak.png'
import streakOutlineAsset from '../assets/streak_outline.png'
import { AvatarSelectionModal } from '../components/modals/AvatarSelectionModal'
import { UsernameEditModal } from '../components/modals/UsernameEditModal'
import { Loader } from '../components/ui/Loader'
import type { User } from '@supabase/supabase-js'

// Import all possible avatars
import jason from '../assets/Jason.png'
import lily from '../assets/Lily.png'
import linda from '../assets/Linda.png'
import mark from '../assets/Mark.png'
import marry from '../assets/Marry.png'

// A helper function to map avatar filenames to imported images
const getAvatar = (avatarUrl: string) => {
  switch (avatarUrl) {
    case 'Jason.png': return jason;
    case 'Lily.png': return lily;
    case 'Linda.png': return linda;
    case 'Mark.png': return mark;
    case 'Marry.png': return marry;
    default:
      // If the avatarUrl is not one of the predefined ones, it might be a full URL.
      // If it's a valid-looking string, use it, otherwise use a default.
      return avatarUrl || lily;
  }
};

const CalendarDay = ({ day, status, isCurrent }: { day?: number, status: 'completed' | 'warning' | 'inactive' | 'future' | 'empty', isCurrent?: boolean }) => {
  if (status === 'empty') return <div className="w-11 h-11" />

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center transition-all relative z-10 border-2",
        status === 'completed' && "bg-duo-green border-white/20 text-white shadow-[0_3px_0_0_#1a7f0e]",
        status === 'warning' && "bg-yellow-400 border-black/10 text-black shadow-[0_3px_0_0_rgba(0,0,0,0.3)]",
        status === 'inactive' && "bg-[#1a232e] border-white/5 text-duo-gray opacity-30",
        status === 'future' && "bg-[#1a232e] border-white/5 text-duo-gray opacity-20",
        isCurrent && "border-white ring-2 ring-white/10"
      )}>
        {status === 'completed' ? (
          <img src={streakOutlineAsset} alt="Streak" className="w-5 h-5" />
        ) : status === 'warning' ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <span className="font-bold text-sm">{day}</span>
        )}
      </div>
    </div>
  )
}

const MonthCalendar = ({ month, year, days, startDay, onPrev, onNext, currentMonthIndex }: { month: string, year: number, days: { day: number, status: 'completed' | 'warning' | 'inactive' | 'future', isCurrent: boolean }[], startDay: number, onPrev: () => void, onNext: () => void, currentMonthIndex: number }) => {
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const emptyDays = Array(startDay).fill(null)

  return (
    <div className="bg-[#1a232e] border-2 border-white/10 rounded-[20px] overflow-hidden mb-8 shadow-[0_6px_0_0_rgba(255,255,255,0.03)]">
      <div className="bg-white/5 py-5 px-6 border-b-2 border-white/5 flex items-center justify-between">
        <button 
          onClick={onPrev}
          disabled={currentMonthIndex === 0}
          className={cn(
            "w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all shadow-[0_3px_0_0_rgba(255,255,255,0.05)]",
            currentMonthIndex === 0 
              ? "bg-[#1a232e]/50 border-white/5 text-white/30 cursor-not-allowed shadow-none" 
              : "bg-[#1a232e] border-white/10 text-white hover:bg-[#252f3d] active:translate-y-0.5 active:shadow-none"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="font-black text-white tracking-tight uppercase text-lg text-center flex-1">{month} {year}</h3>

        <button 
          onClick={onNext}
          disabled={currentMonthIndex === 2}
          className={cn(
            "w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all shadow-[0_3px_0_0_rgba(255,255,255,0.05)]",
            currentMonthIndex === 2 
              ? "bg-[#1a232e]/50 border-white/5 text-white/30 cursor-not-allowed shadow-none" 
              : "bg-[#1a232e] border-white/10 text-white hover:bg-[#252f3d] active:translate-y-0.5 active:shadow-none"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-x-2 gap-y-5 text-center">
          {weekDays.map(d => (
            <div key={d} className="text-duo-gray font-black text-[11px] uppercase tracking-[0.2em] mb-1">{d}</div>
          ))}
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((d, i) => (
            <CalendarDay 
              key={i} 
              day={d.day} 
              status={d.status} 
              isCurrent={d.isCurrent}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ProfilePageProps {
  user: User | null;
  userProfile: any;
  userProgress: any[];
  onUpdateUsername: (newUsername: string) => Promise<boolean>;
  onUpdateAvatar: (newAvatar: string) => Promise<boolean>;
}

export const ProfilePage: FC<ProfilePageProps> = ({ user, userProfile, onUpdateUsername, onUpdateAvatar }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1) // 0 = previous month, 1 = current month, 2 = next month
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false)

  const handleLogout = async () => {
    if (logoutLoading) return
    
    setLogoutLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
      setLogoutLoading(false)
    }
  }

  const handleSaveUsername = async (newUsername: string) => {
    const success = await onUpdateUsername(newUsername)
    if (success) {
      setIsUsernameModalOpen(false)
    } else {
      console.error('Failed to update username.')
      // The modal will show an error message to the user
    }
    return success
  }

  const handleAvatarSelect = async (newAvatar: string) => {
    const success = await onUpdateAvatar(newAvatar)
    if (success) {
      setIsAvatarModalOpen(false)
    } else {
      console.error('Failed to update avatar.')
      // Optionally show an error message to the user
    }
  }

  // Generate only previous, current, and next month for navigation
  interface CalendarMonth {
    name: string;
    monthIndex: number;
    year: number;
    daysInMonth: number;
    startDay: number;
  }
  const months: CalendarMonth[] = []
  const now = new Date()
  for (let i = -1; i <= 1; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push({
      name: date.toLocaleString('default', { month: 'long' }),
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
      daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
      startDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
    })
  }

  const getDaysForMonth = (index: number) => {
    const days: { day: number, status: 'completed' | 'warning' | 'inactive' | 'future', isCurrent: boolean }[] = []
    const month = months[index]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 1; i <= month.daysInMonth; i++) {
      const currentDate = new Date(month.year, month.monthIndex, i)
      currentDate.setHours(0, 0, 0, 0)
      
      let status: 'completed' | 'warning' | 'inactive' | 'future'
      
      if (currentDate > today) {
        status = 'future'
      } else {
        const year = currentDate.getFullYear()
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0')
        const dayStr = String(currentDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${monthStr}-${dayStr}`
        const dayCompleted = userProfile?.streak_dates?.includes(dateStr)

        if (dayCompleted) {
          status = 'completed'
        } else {
          status = 'inactive'
        }
      }
      
      const isCurrent = month.year === today.getFullYear() && 
                        month.monthIndex === today.getMonth() && 
                        i === today.getDate()
      
      days.push({ day: i, status, isCurrent })
    }
    return days
  }

  const currentMonth = months[currentMonthIndex]
  const currentDays = getDaysForMonth(currentMonthIndex)

  return (
    <div className="py-12 px-4 max-w-160 mx-auto">
      {/* Profile Header */}
      <section className="mb-10 pb-10 border-b-2 border-duo-border relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {userProfile ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-black text-white">{userProfile.username}</h1>
                  <button onClick={() => setIsUsernameModalOpen(true)} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                    <Pencil className="w-5 h-5 text-duo-gray" />
                  </button>
                </div>
                <p className="text-duo-gray font-bold text-lg mb-4">@{user?.email}</p>
                <div className="flex items-center gap-2 text-duo-gray font-bold">
                  <Clock className="w-5 h-5" />
                  <span>Joined {new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <Loader />
              </div>
            )}
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-[#1a232e] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_8px_0_0_rgba(0,0,0,0.2)]">
              {userProfile ? (
                <img src={getAvatar(userProfile.avatar_url)} alt="Profile" className="w-24 h-24 object-contain" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center">
                  <Loader className="w-12 h-12" />
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-2 -right-2 p-3 bg-duo-green rounded-2xl border-2 border-white/20 shadow-[0_4px_0_0_#1a7f0e] hover:bg-duo-dark-green transition-all active:translate-y-0.5 active:shadow-none"
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Streak Calendar Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <img src={streakAsset} alt="Streak" className="w-8 h-8 object-contain" />
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Streak Calendar</h2>
        </div>
        <MonthCalendar 
          month={currentMonth.name} 
          year={currentMonth.year} 
          days={currentDays} 
          startDay={currentMonth.startDay}
          onPrev={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
          onNext={() => setCurrentMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
          currentMonthIndex={currentMonthIndex}
        />
        
        {/* Logout Button */}
        <div className="flex justify-center mt-16">
          <button 
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-2 px-6 py-3 bg-duo-red border-2 border-duo-red rounded-xl text-white font-bold uppercase tracking-wider shadow-[0_4px_0_0_#d33131] hover:bg-[#ff5c5c] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </section>

      <UsernameEditModal
        isOpen={isUsernameModalOpen}
        onClose={() => setIsUsernameModalOpen(false)}
        onSave={handleSaveUsername}
        currentUsername={userProfile?.username || ''}
      />
      <AvatarSelectionModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
        onSelect={handleAvatarSelect} 
        currentAvatar={userProfile?.avatar_url} 
      />
    </div>
  )
}