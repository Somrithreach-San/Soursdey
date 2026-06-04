import { cn } from '../../lib/utils'
import homeIcon from '../../assets/home.png'
import letterIcon from '../../assets/letter.png'
import exerciseIcon from '../../assets/excercise.png'
import leaderboardIcon from '../../assets/leaderboard.png'
import storeIcon from '../../assets/store.png'
import questIcon from '../../assets/Quest.png' // Import the correct quest icon
import gearIcon from '../../assets/gear_icon.png'
import { ImageWithLoader } from '../ui/ImageWithLoader'

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
      const scrollOptions: ScrollToOptions = { top: 0, behavior: 'smooth' };
      window.scrollTo(scrollOptions);
      document.documentElement.scrollTo(scrollOptions);
      document.body.scrollTo(scrollOptions);
    }
    clickHandler?.();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-72 h-screen border-r-2 border-duo-border flex-col pt-8 px-4 pb-4 fixed left-0 top-0 bg-duo-dark z-50">
        <div className="px-4 mb-10 flex items-center justify-center relative">
          <h1 className="text-4xl font-black text-duo-green tracking-tighter">Peacode</h1>
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
                  const handlers: { [key: string]: (() => void) | undefined } = {
                    'learn': onLearnClick,
                    'letters': onLettersClick,
                    'practice': onPracticeClick,
                    'leaderboard': onLeaderboardClick,
                    'quests': onQuestsClick,
                    'shop': onStoreClick,
                    'profile': onProfileClick,
                    'settings': onSettingsClick
                  }
                  handleNavClick(view, handlers[view])
                }}
                className={cn(
                  "sidebar-item group",
                  isActive && "active"
                )}
              >
                <ImageWithLoader 
                  src={Icon as string} 
                  alt={label}
                  className="w-6 h-6"
                  imgClassName="object-contain"
                  loaderClassName="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  {label === 'Profile' && userProfile?.is_subscribed && (
                    <span className="bg-duo-green text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase text-white shadow-[0_1.5px_0_0_#46a302] leading-none">
                      PRO
                    </span>
                  )}
                </div>
              </a>
            )
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[calc(4.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-duo-dark flex items-center justify-around px-2 z-50 border-t-2 border-duo-border">
        {menuItems.filter(item => item.view !== 'settings' && item.view !== 'shop').map((item) => {
          const { icon: Icon, label, view } = item
          const isActive = currentView === view

          return (
            <button
              key={label}
              onClick={() => {
                const handlers: { [key: string]: (() => void) | undefined } = {
                  'learn': onLearnClick,
                  'letters': onLettersClick,
                  'practice': onPracticeClick,
                  'leaderboard': onLeaderboardClick,
                  'quests': onQuestsClick,
                  'shop': onStoreClick,
                  'profile': onProfileClick,
                  'settings': onSettingsClick
                }
                handleNavClick(view, handlers[view])
              }}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all relative border-2 border-transparent",
                isActive && "border-duo-green bg-duo-green/10"
              )}>
                <ImageWithLoader 
                  src={Icon as string} 
                  alt={label}
                  className="w-7 h-7"
                  imgClassName="object-contain"
                  loaderClassName="w-4 h-4"
                />
                {label === 'Profile' && userProfile?.is_subscribed && (
                  <div className="absolute -top-1.5 -right-1 bg-duo-green text-[8px] font-black px-1 py-0.5 rounded shadow-[0_1px_0_0_#46a302] text-white leading-none uppercase">
                    PRO
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}