import { useState, useEffect, type FC } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts'

interface UsernameEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newUsername: string) => Promise<boolean>
  currentUsername: string
}

export const UsernameEditModal: FC<UsernameEditModalProps> = ({ isOpen, onClose, onSave, currentUsername }) => {
  const { theme } = useTheme()
  const [username, setUsername] = useState(currentUsername)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername === 'New User' ? '' : currentUsername)
      setError('')
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
  }, [isOpen, currentUsername])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty.')
      return
    }
    
    setIsSaving(true)
    setError('')
    
    const success = await onSave(username.trim())
    
    setIsSaving(false)
    
    if (success) {
      onClose()
    } else {
      setError('Failed to update username. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className={cn(
        "border-2 rounded-2xl p-8 max-w-sm w-full relative",
        theme === 'light' ? "bg-white border-[#E5E5E5]" : "bg-[#1a232e] border-white/10"
      )} onClick={e => e.stopPropagation()}>
        <h2 className={cn(
          "text-2xl font-black mb-4",
          theme === 'light' ? "text-[#4b4b4b]" : "text-white"
        )}>Edit Username</h2>
        
        <div className="mb-4">
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(
              "w-full text-lg font-bold border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-duo-green",
              theme === 'light' 
                ? "text-[#4b4b4b] bg-[#F7F7F7] border-[#E5E5E5]" 
                : "text-white bg-duo-dark-blue border-duo-border"
            )}
            placeholder="Set username"
          />
          {error && <p className="text-duo-red text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className={cn(
              "px-6 py-2 font-bold rounded-lg transition-all active:translate-y-0.5 active:shadow-none",
              theme === 'light'
                ? "bg-[#E5E5E5] text-[#4b4b4b] shadow-[0_3px_0_0_#afafaf] hover:bg-[#d1d1d1]"
                : "bg-duo-gray/20 text-white shadow-[0_3px_0_0_#37464f] hover:bg-duo-gray/30"
            )}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-duo-green text-white font-bold rounded-lg shadow-[0_3px_0_0_#1a7f0e] hover:bg-duo-dark-green transition-all active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
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