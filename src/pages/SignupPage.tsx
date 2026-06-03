import { useState } from 'react'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'
import { useUser } from '../contexts'
import logo from '../assets/sursdey_logo.png' // Import correct logo file
import { Loader } from '../components/ui/Loader'

export const SignupPage = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const { signup, error } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (!email || !password || !confirmPassword) {
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

    setIsLoading(true)
    try {
      await signup(email, password)
      // Show success screen instead of immediately redirecting
      setIsSuccess(true)
    } catch (err) {
      console.error('Signup error:', err)
      setLocalError(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="bg-[#1a232e] border-2 border-duo-border rounded-3xl p-8 shadow-[0_8px_0_0_#202f36] flex flex-col items-center">
            <img src={logo} alt="Soursdey Logo" className="w-20 h-20 mb-6" />
            <h1 className="text-3xl font-black text-duo-green mb-4 uppercase tracking-wide">
              Verify Email
            </h1>
            <p className="text-duo-gray font-bold text-sm mb-8 leading-relaxed max-w-xs">
              We've sent a verification link to <span className="text-white block truncate">{email}</span> Please check your inbox and confirm your email before logging in.
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
          <p className="text-duo-gray font-bold">Start learning today!</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">


          {/* Email Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                id="signup-email"
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
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
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
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-white font-bold text-sm uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-duo-gray" />
              <input
                id="signup-confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={cn(
                  "w-full pl-12 pr-12 py-3.5 bg-[#1a232e] border-2 rounded-xl text-white placeholder-duo-gray font-bold focus:outline-none transition-colors",
                  (error || localError) ? 'border-duo-red' : 'border-duo-border focus:border-duo-green'
                )}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 text-white" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
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
      </div>
    </div>
  )
}