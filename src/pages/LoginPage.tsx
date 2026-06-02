import { useState } from 'react'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'
import { useUser, RateLimitError } from '../contexts/UserContext'
import logo from '../assets/sursdey_logo.png' // Import correct logo file

export const LoginPage = ({ onSignupClick }: { onSignupClick?: () => void }) => {
  const { login, error, resetPassword } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [view, setView] = useState<'login' | 'forgot_password'>('login')
  const [resetMessage, setResetMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      // Login with email only
      await login(email, password)
    } catch (err) {
      if (err instanceof Error && err.message.includes('Email not confirmed')) {
        setLocalError('Please confirm your email. Check your inbox for the confirmation link.');
      } else {
        setLocalError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    setResetMessage('')

    if (!email) {
      setLocalError('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
      setResetMessage('If an account with this email exists, a password reset link has been sent.')
    } catch (err) {
      if (err instanceof RateLimitError) {
        setLocalError(err.message)
      } else {
        // For security, we show a generic message even on other errors
        setResetMessage('If an account with this email exists, a password reset link has been sent.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (view === 'forgot_password') {
    return (
      <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-12 flex flex-col items-center">
            <img src={logo} alt="Soursdey Logo" className="w-24 h-24 mb-4" />
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Reset Password</h1>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-4">
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
                  className="w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none focus:border-duo-green border-duo-border"
                  disabled={isLoading}
                />
              </div>
            </div>

            {resetMessage && (
              <div className="p-3 bg-duo-green/20 border-2 border-duo-green rounded-xl">
                <p className="text-duo-green font-bold text-sm">{resetMessage}</p>
              </div>
            )}

            {localError && (
              <div className="p-3 bg-duo-red/20 border-2 border-duo-red rounded-xl">
                <p className="text-duo-red font-bold text-sm">{localError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!resetMessage}
              className="w-full py-4 px-6 bg-duo-green text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-brutal-green hover:bg-[#61e002] active:translate-y-1 active:shadow-none disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-duo-gray font-bold">
              Remembered your password?{' '}
              <button
                onClick={() => {
                  setView('login')
                  setLocalError('')
                  setResetMessage('')
                }}
                className="text-duo-green font-black hover:underline"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <img src={logo} alt="Soursdey Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-5xl font-black text-duo-green tracking-tighter mb-2">
            Soursdey
          </h1>
          <p className="text-duo-gray font-bold">Welcome back!</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "w-full pl-12 pr-4 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-colors",
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
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-colors",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => setView('forgot_password')}
                className="text-sm font-bold text-duo-gray hover:text-duo-green transition-colors"
              >
                Forgot Password?
              </button>
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
                : "bg-duo-green text-white shadow-brutal-green hover:bg-[#61e002] active:translate-y-1 active:shadow-none"
            )}
          >
            {isLoading ? 'Logging in...' : 'Login'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <p className="text-duo-gray font-bold">
            Don't have an account?{' '}
            <button
              onClick={onSignupClick}
              className="text-duo-green font-black hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}