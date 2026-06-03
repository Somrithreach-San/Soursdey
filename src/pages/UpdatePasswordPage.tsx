import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Loader } from '../components/ui/Loader'

export const UpdatePasswordPage = () => {
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
    <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Update Your Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none focus:border-duo-green border-duo-border"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none focus:border-duo-green border-duo-border"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray">
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <p className="text-duo-red text-sm font-bold">{error}</p>}
          {message && <p className="text-duo-green text-sm font-bold">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-duo-green text-white font-black uppercase tracking-widest rounded-xl shadow-brutal-green hover:bg-[#61e002] active:translate-y-1 active:shadow-none disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transition-all"
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