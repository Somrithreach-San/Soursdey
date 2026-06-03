import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Loader } from '../components/ui/Loader'
import { useTheme } from '../contexts'
import { cn } from '../lib/utils'

export const UpdatePasswordPage = () => {
  const { theme } = useTheme()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // The user is in the password recovery flow
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    }
    setIsLoading(false)
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center px-4",
      theme === 'light' ? "bg-white" : "bg-duo-dark"
    )}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={cn(
            "text-3xl font-black tracking-tight uppercase",
            theme === 'light' ? "text-[#4B4B4B]" : "text-white"
          )}>Update Your Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={cn(
              "block font-bold text-sm uppercase tracking-wider mb-2",
              theme === 'light' ? "text-[#4B4B4B]" : "text-white"
            )}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 border-2 rounded-xl font-bold focus:outline-none transition-colors",
                  theme === 'light' 
                    ? "bg-white text-[#4B4B4B] border-[#E5E5E5] placeholder-duo-gray/60 focus:border-duo-green" 
                    : "bg-[#1a232e] text-white border-duo-border placeholder-duo-gray focus:border-duo-green"
                )}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray transition-colors",
                theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white"
              )}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div>
            <label className={cn(
              "block font-bold text-sm uppercase tracking-wider mb-2",
              theme === 'light' ? "text-[#4B4B4B]" : "text-white"
            )}>Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 border-2 rounded-xl font-bold focus:outline-none transition-colors",
                  theme === 'light' 
                    ? "bg-white text-[#4B4B4B] border-[#E5E5E5] placeholder-duo-gray/60 focus:border-duo-green" 
                    : "bg-[#1a232e] text-white border-duo-border placeholder-duo-gray focus:border-duo-green"
                )}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray transition-colors",
                theme === 'light' ? "hover:text-[#4B4B4B]" : "hover:text-white"
              )}>
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <p className="text-duo-red text-sm font-bold">{error}</p>}
          {message && <p className="text-duo-green text-sm font-bold">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 mt-4 bg-duo-green text-white font-black uppercase tracking-widest rounded-xl shadow-brutal-green hover:bg-[#61e002] active:translate-y-1 active:shadow-none disabled:shadow-none disabled:cursor-not-allowed transition-all",
              theme === 'light' ? "disabled:bg-[#E5E5E5] disabled:text-[#AFAFAF]" : "disabled:bg-gray-600"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 text-white mr-2" />
                <span>UPDATING...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}