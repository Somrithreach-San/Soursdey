import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

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
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#1a232e] border-2 border-white/10 rounded-2xl p-8 max-w-lg w-full relative">
        <h2 className="text-2xl font-black text-white mb-6">Choose Your Avatar</h2>
        <div className="grid grid-cols-3 gap-6 mb-6">
          {avatars.map(avatar => (
            <button 
              key={avatar.name}
              onClick={() => onSelect(avatar.src)}
              className={cn(
                "p-2 rounded-xl border-2 transition-all",
                currentAvatar === avatar.src ? "border-duo-green bg-duo-green/20" : "border-transparent hover:bg-white/10"
              )}
            >
              <img src={avatar.src} alt={avatar.name} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-duo-gray hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}