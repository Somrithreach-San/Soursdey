import { useState } from 'react'
import { Clock, Pencil, AlertTriangle, Dumbbell, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'
import streakAsset from '../assets/streak.png'
import lily from '../assets/Lily.png'

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

export const ProfilePage = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0) // 0 for May, 1 for June, etc.

  const months = [
    { name: 'May', year: 2026, startDay: 5, daysCount: 31 },
    { name: 'June', year: 2026, startDay: 1, daysCount: 30 },
    { name: 'July', year: 2026, startDay: 3, daysCount: 31 },
  ]

  const getDaysForMonth = (index: number) => {
    const days: { day: number, status: 'completed' | 'warning' | 'inactive' | 'future' }[] = []
    const month = months[index]
    
    for (let i = 1; i <= month.daysCount; i++) {
      let status: 'completed' | 'warning' | 'inactive' | 'future'
      
      if (index === 0) { // May
        if (i < 28) {
          // Realistic streak: 6 days this month
          if ([22, 23, 24, 25, 26, 27].includes(i)) {
            status = 'completed'
          } else {
            status = 'inactive'
          }
        } else if (i === 28) {
          status = 'inactive'
        } else {
          status = 'future'
        }
      } else { // June and beyond
        status = 'future'
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
            <h1 className="text-3xl font-black text-white mb-2">Engly Lang</h1>
            <p className="text-duo-gray font-bold text-lg mb-4">@englylang123</p>
            <div className="flex items-center gap-2 text-duo-gray font-bold">
              <Clock className="w-5 h-5" />
              <span>Joined May 2026</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-[#1a232e] border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-[0_8px_0_0_rgba(0,0,0,0.2)]">
              <img src={lily} alt="Profile" className="w-24 h-24 object-contain" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-duo-green rounded-2xl border-2 border-white/20 shadow-[0_4px_0_0_#1a7f0e] hover:bg-duo-dark-green transition-all active:translate-y-0.5 active:shadow-none">
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
            onClick={() => console.log('Logout clicked')}
            className="flex items-center gap-2 px-6 py-3 bg-duo-red border-2 border-duo-red rounded-xl text-white font-bold uppercase tracking-wider shadow-[0_4px_0_0_#d33131] hover:bg-[#ff5c5c] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </section>
    </div>
  )
}