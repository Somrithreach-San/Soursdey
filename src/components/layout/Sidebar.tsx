import { cn } from '../../lib/utils'
import homeIcon from '../../assets/home.png'
import letterIcon from '../../assets/letter.png'
import exerciseIcon from '../../assets/excercise.png'
import storeIcon from '../../assets/store.png'
import lily from '../../assets/Lily.png'


export const Sidebar = ({ 
  currentView = 'learn', 
  onStoreClick,
  onLearnClick,
  onLettersClick,
  onPracticeClick,
  onProfileClick
}: { 
  currentView?: 'learn' | 'shop' | 'letters' | 'practice' | 'profile',
  onStoreClick?: () => void,
  onLearnClick?: () => void,
  onLettersClick?: () => void,
  onPracticeClick?: () => void,
  onProfileClick?: () => void
}) => {
  const menuItems = [
    { icon: homeIcon, label: 'Learn', view: 'learn' },
    { icon: letterIcon, label: 'Letters', view: 'letters' },
    { icon: exerciseIcon, label: 'Practice', view: 'practice' },
    { icon: storeIcon, label: 'Store', view: 'shop' },
    { icon: lily, label: 'Profile', view: 'profile' },
  ]

  return (
    <div className="w-72 h-screen border-r-2 border-duo-border flex flex-col pt-8 px-4 pb-4 fixed left-0 top-0 bg-duo-dark">
      <div className="px-4 mb-10 flex items-center justify-center">
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
                if (label === 'Store') onStoreClick?.()
                if (label === 'Learn') onLearnClick?.()
                if (label === 'Letters') onLettersClick?.()
                if (label === 'Practice') onPracticeClick?.()
                if (label === 'Profile') onProfileClick?.()
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
              <span>{label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}