import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts'
import { ImageWithLoader } from '../ui/ImageWithLoader'

import lily from '../../assets/Lily.png'
import jason from '../../assets/Jason.png'
import marry from '../../assets/Marry.png'
import linda from '../../assets/Linda.png'
import mark from '../../assets/Mark.png'

const avatars = [
  { name: 'Lily', src: lily },
  { name: 'Jason', src: jason },
  { name: 'Marry', src: marry },
  { name: 'Linda', src: linda },
  { name: 'Mark', src: mark },
]

export const AvatarSelectionModal = ({ isOpen, onClose, onSelect, currentAvatar }: { isOpen: boolean, onClose: () => void, onSelect: (avatar: string) => void, currentAvatar: string }) => {
  const { theme } = useTheme()
  useEffect(() => {
    if (isOpen) {
      // Disable background scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to re-enable scroll if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className={cn(
        "border-2 rounded-2xl p-8 max-w-lg w-full relative",
        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-[#1a232e] border-white/10"
      )} onClick={e => e.stopPropagation()}>
        <h2 className={cn(
          "text-2xl font-black mb-6",
          theme === 'light' ? "text-[#4b4b4b]" : "text-white"
        )}>Choose Your Avatar</h2>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {avatars.map(avatar => (
            <button 
              key={avatar.name}
              onClick={() => onSelect(`${avatar.name}.png`)}
              className={cn(
                "p-2 rounded-xl border-2 transition-all",
                currentAvatar === avatar.src 
                  ? "border-duo-green bg-duo-green/20" 
                  : (theme === 'light' ? "border-transparent hover:bg-[#F7F7F7]" : "border-transparent hover:bg-white/10")
              )}
            >
              <ImageWithLoader 
                src={avatar.src} 
                alt={avatar.name} 
                className="w-full aspect-square"
                imgClassName="object-contain"
                loaderClassName="w-6 h-6"
              />
            </button>
          ))}
        </div>
        <button onClick={onClose} className={cn(
          "absolute top-4 right-4",
          theme === 'light' ? "text-[#afafaf] hover:text-[#4b4b4b]" : "text-duo-gray hover:text-white"
        )}>
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}