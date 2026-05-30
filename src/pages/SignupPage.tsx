import { useState } from 'react'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { useUser } from '../contexts'

export const SignupPage = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const { signup, isLoading, error } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (!email || !password || !confirmPassword || !username) {
      setLocalError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    if (username.length < 2) {
      setLocalError('Username must be at least 2 characters')
      return
    }

    try {
      await signup(email, password, username)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-duo-green tracking-tighter mb-2">
            Soursdey
          </h1>
          <p className="text-duo-gray font-bold">Start learning today!</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your username"
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-all",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-all",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-all",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-all",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="p-3 bg-duo-red/20 border-2 border-duo-red rounded-xl">
              <p className="text-duo-red font-bold text-sm">{error || localError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 px-6 font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mt-6",
              isLoading
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-duo-green text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#61e002] active:translate-y-1 active:shadow-none"
            )}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-duo-gray font-bold">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-duo-green font-black hover:underline"
            >
              Log in
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-duo-border text-center text-duo-gray text-xs font-bold opacity-60">
          <p>By signing up, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  )
}
