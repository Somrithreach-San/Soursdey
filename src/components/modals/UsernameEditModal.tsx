import { useState, useEffect, type FC } from 'react'
import { X } from 'lucide-react'

interface UsernameEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newUsername: string) => Promise<boolean>
  currentUsername: string
}

export const UsernameEditModal: FC<UsernameEditModalProps> = ({ isOpen, onClose, onSave, currentUsername }) => {
  const [username, setUsername] = useState(currentUsername)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername)
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
      <div className="bg-[#1a232e] border-2 border-white/10 rounded-2xl p-8 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-black text-white mb-4">Edit Username</h2>
        
        <div className="mb-4">
          <label htmlFor="username-input" className="text-duo-gray font-bold mb-2 block">
            New username
          </label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-lg font-bold text-white bg-duo-dark-blue border-2 border-duo-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-duo-green"
            placeholder="Enter new username"
          />
          {error && <p className="text-duo-red text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-duo-gray/20 text-white font-bold rounded-lg hover:bg-duo-gray/30 transition-colors"
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

        <button onClick={onClose} className="absolute top-4 right-4 text-duo-gray hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}