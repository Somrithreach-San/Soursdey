import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import {
  getUserProfile,
  updateUserProfile,
  createProfile,
  incrementStreak,
  addDiamonds,
  removeDiamonds,
  addHearts,
  removeHearts,
  type Profile,
} from '../services'

interface UserContextType {
  // Auth state
  user: User | null
  userId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // User data
  profile: Profile | null

  // Functions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>

  // Profile update functions
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<void>
  incrementUserStreak: () => Promise<void>
  addUserDiamonds: (amount: number) => Promise<void>
  removeUserDiamonds: (amount: number) => Promise<void>
  addUserHearts: (amount: number) => Promise<void>
  removeUserHearts: (amount: number) => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        setUserId(session.user.id)
        setIsAuthenticated(true)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserId(null)
        setIsAuthenticated(false)
        setProfile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check auth status')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (id: string) => {
    try {
      const data = await getUserProfile(id)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        setUser(data.user)
        setUserId(data.user.id)
        setIsAuthenticated(true)
        await fetchUserProfile(data.user.id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, username: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        // Create profile
        const newProfile = await createProfile(data.user.id, username)
        setUser(data.user)
        setUserId(data.user.id)
        setIsAuthenticated(true)
        setProfile(newProfile)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      setUser(null)
      setUserId(null)
      setIsAuthenticated(false)
      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      throw err
    }
  }

  const refreshProfile = async () => {
    if (!userId) return
    try {
      setError(null)
      await fetchUserProfile(userId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile')
    }
  }

  const updateProfile = async (
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
  ) => {
    if (!userId) return
    try {
      setError(null)
      await updateUserProfile(userId, updates)
      await refreshProfile() // This ensures the profile is fresh everywhere
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const incrementUserStreak = async () => {
    if (!userId) return
    try {
      setError(null)
      await incrementStreak(userId)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increment streak')
      throw err
    }
  }

  const addUserDiamonds = async (amount: number) => {
    if (!userId) return
    try {
      setError(null)
      await addDiamonds(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add diamonds')
      throw err
    }
  }

  const removeUserDiamonds = async (amount: number) => {
    if (!userId) return
    try {
      setError(null)
      await removeDiamonds(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove diamonds')
      throw err
    }
  }

  const addUserHearts = async (amount: number) => {
    if (!userId) return
    try {
      setError(null)
      await addHearts(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add hearts')
      throw err
    }
  }

  const removeUserHearts = async (amount: number) => {
    if (!userId) return
    try {
      setError(null)
      await removeHearts(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove hearts')
      throw err
    }
  }

  const value: UserContextType = {
    user,
    userId,
    isAuthenticated,
    isLoading,
    error,
    profile,
    login,
    signup,
    logout,
    refreshProfile,
    updateProfile,
    incrementUserStreak,
    addUserDiamonds,
    removeUserDiamonds,
    addUserHearts,
    removeUserHearts,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}