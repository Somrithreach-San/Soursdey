import { cn } from '../../lib/utils'
import homeIcon from '../../assets/home.png'
import letterIcon from '../../assets/letter.png'
import exerciseIcon from '../../assets/excercise.png'
import leaderboardIcon from '../../assets/leaderboard.png'
import storeIcon from '../../assets/store.png'
import questIcon from '../../assets/Quest.png' // Import the correct quest icon
import gearIcon from '../../assets/gear_icon.png'

// Import all possible avatars
import jason from '../../assets/Jason.png'
import lily from '../../assets/Lily.png'
import linda from '../../assets/Linda.png'
import mark from '../../assets/Mark.png'
import marry from '../../assets/Marry.png'

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



export const Sidebar = ({ 
  userProfile,
  currentView = 'learn', 
  onStoreClick,
  onLearnClick,
  onLettersClick,
  onPracticeClick,
  onProfileClick,
  onQuestsClick,
  onLeaderboardClick,
  onSettingsClick
}: { 
  userProfile: any,
  currentView?: 'learn' | 'shop' | 'letters' | 'practice' | 'profile' | 'quests' | 'leaderboard' | 'settings',
  onStoreClick?: () => void,
  onLearnClick?: () => void,
  onLettersClick?: () => void,
  onPracticeClick?: () => void,
  onProfileClick?: () => void,
  onQuestsClick?: () => void,
  onLeaderboardClick?: () => void,
  onSettingsClick?: () => void
}) => {
  const menuItems = [
    { icon: homeIcon, label: 'Learn', view: 'learn' },
    { icon: letterIcon, label: 'Letters', view: 'letters' },
    { icon: exerciseIcon, label: 'Practice', view: 'practice' },
    { icon: leaderboardIcon, label: 'Leaderboard', view: 'leaderboard' },
    { icon: questIcon, label: 'Quests', view: 'quests' }, // Use the correct quest icon
    { icon: storeIcon, label: 'Store', view: 'shop' },
    { icon: getAvatar(userProfile?.avatar_url), label: 'Profile', view: 'profile' },
    { icon: gearIcon, label: 'Settings', view: 'settings' },
  ]

  const handleNavClick = (view: string, clickHandler?: () => void) => {
    if (currentView === view) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    clickHandler?.();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 h-screen border-r-2 border-duo-border flex-col pt-8 px-4 pb-4 fixed left-0 top-0 bg-duo-dark z-50">
        <div className="px-4 mb-10 flex items-center justify-center relative">
          <h1 className="text-4xl font-black text-duo-green tracking-tighter">Soursdey</h1>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => {
            const { icon: Icon, label, view } = item
            const isActive = currentView === view

            return (
              <a
                key={label}
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (view === 'learn') handleNavClick('learn', onLearnClick)
                  if (view === 'letters') handleNavClick('letters', onLettersClick)
                  if (view === 'practice') handleNavClick('practice', onPracticeClick)
                  if (view === 'leaderboard') handleNavClick('leaderboard', onLeaderboardClick)
                  if (view === 'quests') handleNavClick('quests', onQuestsClick)
                  if (view === 'shop') handleNavClick('shop', onStoreClick)
                  if (view === 'profile') handleNavClick('profile', onProfileClick)
                  if (view === 'settings') handleNavClick('settings', onSettingsClick)
                }}
                className={cn(
                  "sidebar-item group",
                  isActive && "active"
                )}
              >
                <img 
                  src={Icon as string} 
                  alt={label}
                  className="w-6 h-6 object-contain"
                />
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                </div>
              </a>
            )
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-18 bg-duo-dark flex items-center justify-around px-2 z-50">
        {menuItems.filter(item => item.view !== 'settings' && item.view !== 'shop').map((item) => {
          const { icon: Icon, label, view } = item
          const isActive = currentView === view

          return (
            <button
              key={label}
              onClick={() => {
                if (view === 'learn') handleNavClick('learn', onLearnClick)
                if (view === 'letters') handleNavClick('letters', onLettersClick)
                if (view === 'practice') handleNavClick('practice', onPracticeClick)
                if (view === 'leaderboard') handleNavClick('leaderboard', onLeaderboardClick)
                if (view === 'quests') handleNavClick('quests', onQuestsClick)
                if (view === 'shop') handleNavClick('shop', onStoreClick)
                if (view === 'profile') handleNavClick('profile', onProfileClick)
                if (view === 'settings') handleNavClick('settings', onSettingsClick)
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative",
                isActive ? "text-duo-green" : "text-duo-gray hover:text-white"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all relative",
                isActive && "bg-duo-green/10"
              )}>
                <img 
                  src={Icon as string} 
                  alt={label}
                  className={cn(
                    "w-6 h-6 object-contain",
                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  )}
                />
              </div>
              <div className="flex flex-col items-center">
                {isActive && (
                  <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-8 h-1 bg-duo-green rounded-full shadow-[0_0_8px_rgba(88,204,2,0.5)]" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}