import { useState, type FC } from 'react'
import { Clock, Pencil, AlertTriangle, Dumbbell, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import streakAsset from '../assets/streak.png'
import { AvatarSelectionModal } from '../components/modals/AvatarSelectionModal'
import { UsernameEditModal } from '../components/modals/UsernameEditModal'
import { Loader } from '../components/ui/Loader'
import type { User } from '@supabase/supabase-js'

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
          day && day % 3 === 0 ? <span className="font-black text-sm">{day}</span> : <Dumbbell className="w-5 h-5" />
        ) : status === 'warning' ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <span className="font-bold text-sm">{day}</span>
        )}
      </div>
    </div>
  )
}

const MonthCalendar = ({ month, year, days, startDay, onPrev, onNext }: { month: string, year: number, days: { day: number, status: 'completed' | 'warning' | 'inactive' | 'future' }[], startDay: number, onPrev: () => void, onNext: () => void }) => {
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const emptyDays = Array(startDay).fill(null)

  return (
    <div className="bg-[#1a232e] border-2 border-white/10 rounded-[20px] overflow-hidden mb-8 shadow-[0_6px_0_0_rgba(255,255,255,0.03)]">
      <div className="bg-white/5 py-5 px-6 border-b-2 border-white/5 flex items-center justify-between">
        <button 
          onClick={onPrev}
          className="w-10 h-10 bg-[#1a232e] border-2 border-white/10 rounded-xl flex items-center justify-center text-white shadow-[0_3px_0_0_rgba(255,255,255,0.05)] hover:bg-[#252f3d] active:translate-y-0.5 active:shadow-none transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="font-black text-white tracking-tight uppercase text-lg text-center flex-1">{month} {year}</h3>

        <button 
          onClick={onNext}
          className="w-10 h-10 bg-[#1a232e] border-2 border-white/10 rounded-xl flex items-center justify-center text-white shadow-[0_3px_0_0_rgba(255,255,255,0.05)] hover:bg-[#252f3d] active:translate-y-0.5 active:shadow-none transition-all"
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
              isCurrent={month === 'May' && d.day === 28}
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

export const ProfilePage: FC<ProfilePageProps> = ({ user, userProfile, userProgress, onUpdateUsername, onUpdateAvatar }) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth() - 4) // Start with May
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
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleSaveUsername = async (newUsername: string) => {
    const success = await onUpdateUsername(newUsername)
    if (success) {
      setIsUsernameModalOpen(false)
      console.log('Username updated successfully!')
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
      console.log('Avatar updated successfully!')
    } else {
      console.error('Failed to update avatar.')
      // Optionally show an error message to the user
    }
  }

  const months = [
    { name: 'May', year: 2026, startDay: 5, daysCount: 31 },
    { name: 'June', year: 2026, startDay: 1, daysCount: 30 },
    { name: 'July', year: 2026, startDay: 3, daysCount: 31 },
  ]

  const getDaysForMonth = (index: number) => {
    const days: { day: number, status: 'completed' | 'warning' | 'inactive' | 'future' }[] = []
    const month = months[index]
    const today = new Date()
    
    for (let i = 1; i <= month.daysCount; i++) {
      const currentDate = new Date(month.year, index + 4, i) // Adjust month index
      
      let status: 'completed' | 'warning' | 'inactive' | 'future'
      
      if (currentDate > today) {
        status = 'future'
      } else {
        const dayCompleted = userProgress?.some(p => {
          const progressDate = new Date(p.last_accessed)
          return progressDate.toDateString() === currentDate.toDateString()
        })

        if (dayCompleted) {
          status = 'completed'
        } else {
          status = 'inactive'
        }
      }
      
      days.push({ day: i, status })
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
                <img src={userProfile.avatar_url} alt="Profile" className="w-24 h-24 object-contain" />
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