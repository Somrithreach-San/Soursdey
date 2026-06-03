import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { type User, AuthApiError } from '@supabase/supabase-js'

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}
import {
  getUserProfile,
  updateUserProfile,
  createProfile,
  incrementStreak,
  addDiamonds,
  removeDiamonds,
  addHearts,
  removeHearts,
  addXp,
  getUserQuests,
  updateSubscription,
  type Profile,
  type UserQuest, // Import the new type
} from '../services'
import { addStreakFreezer as addStreakFreezerToUser, refreshDailyQuests } from '../services/userService'
interface UserContextType {
  // Auth state
  user: User | null
  userId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // User data
  profile: Profile | null
  quests: UserQuest[]

  // Functions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>

  // Profile update functions
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<void>
  incrementUserStreak: (options?: { lessonCompleted: boolean }) => Promise<{ newStreak: number; streakChanged: boolean } | null | undefined>
  addUserDiamonds: (amount: number) => Promise<void>
  removeUserDiamonds: (amount: number) => Promise<void>
  addUserHearts: (amount: number) => Promise<void>
  removeUserHearts: (amount: number) => Promise<void>
  updateUserSubscription: (tier: 'pro' | 'family', isTrial?: boolean) => Promise<void>
  claimUserQuestReward: (questId: string) => Promise<void>
  addStreakFreezer: (quantity?: number) => Promise<void>
  addUserXp: (amount: number) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quests, setQuests] = useState<UserQuest[]>([])
  // Guard ref: prevents onAuthStateChange from interfering during signup flow
  const isSigningUpRef = useRef(false)

  // Check auth status on mount and set up auth state listener
  useEffect(() => {
    checkAuthStatus()
    
    // Listen for auth changes.
    // onAuthStateChange fires once immediately on mount AND on any future auth events.
    // We keep it lightweight to avoid racing with checkAuthStatus() on initial load.
    // The isSigningUpRef guard prevents it from interfering with the signup flow.
    // For cross-tab email confirmation, we detect a session appearing with no loaded
    // profile and trigger a non-blocking data fetch.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip listener logic entirely while signup is in progress
      if (isSigningUpRef.current) return

      if (session?.user) {
        // Only set authenticated state if the user has confirmed their email
        // If email is not confirmed, don't log them in automatically
        if (session.user.email_confirmed_at) {
          setUser(session.user)
          setUserId(session.user.id)
          setIsAuthenticated(true)
          // For cross-tab SIGNED_IN (e.g. email confirmation link opened in new tab),
          // load profile/quests if they haven't been loaded yet.
          if (event === 'SIGNED_IN') {
            setProfile(prev => {
              if (prev === null) {
                fetchUserProfile(session.user.id).catch(console.error)
                fetchUserQuests(session.user.id).catch(console.error)
              }

              return prev
            })
          }
        } else {
          // Email not confirmed, sign out to force manual login after confirmation
          supabase.auth.signOut().catch(console.error)
          setUser(null)
          setUserId(null)
          setIsAuthenticated(false)
          setProfile(null)
          setQuests([])
        }
      } else {
        setUser(null)
        setUserId(null)
        setIsAuthenticated(false)
        setProfile(null)
        setQuests([])
      }
    })

    return () => subscription.unsubscribe()
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
        try {
          await fetchUserProfile(session.user.id)
          await fetchUserQuests(session.user.id) // Fetch quests on login
        } catch (err) {
          // If profile not found (user deleted from database), clear ALL auth state
          if (err instanceof Error && err.message.includes('PGRST116')) {
            console.log('Profile not found - clearing stale auth state')
            // Clear local storage to fix cache issues
            localStorage.clear()
            sessionStorage.clear()
            // Sign out from supabase
            await supabase.auth.signOut()
            // Reset all state
            setUser(null)
            setUserId(null)
            setIsAuthenticated(false)
            setProfile(null)
            setQuests([])
          } else {
            throw err
          }
        }
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

  const fetchUserQuests = async (id: string) => {
    try {
      // Refresh daily quests first - this will automatically reset quests if it's a new day
      await refreshDailyQuests(id);
      
      // Fetch the updated quests
      let questsData = await getUserQuests(id);
      setQuests(questsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user quests');
    }
  };

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
        await fetchUserQuests(data.user.id) // Fetch quests on login
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string) => {
    // Engage the guard so onAuthStateChange doesn't interfere
    isSigningUpRef.current = true
    try {
      setError(null)
      setIsLoading(true)
      
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        // Create default username from email
        const defaultUsername = email.split('@')[0];
        // Create profile in DB and assign quests
        await createProfile(data.user.id, defaultUsername, email)

        // Clear any existing user state and sign out to force manual login after email confirmation
        await supabase.auth.signOut();
        setUser(null)
        setUserId(null)
        setProfile(null)
        setIsAuthenticated(false);
        // Don't return anything - let SignupPage's isSuccess state handle the UI
      }
    } catch (err) {
      console.error('Signup error:', err);
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
      isSigningUpRef.current = false
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
      setQuests([])
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
      await fetchUserQuests(userId) // Also refresh quests
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile')
    }
  }

  const updateProfile = async (
    updates: Partial<Omit<Profile, 'id' | 'created_at'>>
  ) => {
    if (!userId || !profile) return;
  
    // Optimistic UI update
    const previousProfile = profile;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
  
    try {
      setError(null);
      // Persist changes to the database
      await updateUserProfile(userId, updates);
    } catch (err) {
      // If the update fails, revert the optimistic update and show an error
      setProfile(previousProfile);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const incrementUserStreak = async (_options?: { lessonCompleted: boolean }) => {
    if (!userId || !profile) return null;
  
    // Optimistic UI update
    const previousProfile = profile;
  
    try {
      setError(null);
      // Call the service and get the result
      const result = await incrementStreak(userId);
      
      // Update local state with the new streak from the result
      if (result && result.streakChanged) {
        setProfile(prev => prev ? { ...prev, streak: result.newStreak } : null);
      }
      
      return result;
    } catch (err) {
      // Revert on failure
      setProfile(previousProfile);
      setError(err instanceof Error ? err.message : 'Failed to increment streak');
      throw err;
    }
  };

  const addStreakFreezer = async (quantity: number = 1) => {
    if (!userId) return
    try {
      setError(null)
      await addStreakFreezerToUser(userId, quantity)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add streak freezer')
      throw err
    }
  }

  const addUserXp = async (amount: number) => {
    if (!userId) return
    try {
      setError(null)
      await addXp(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add XP')
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
    if (!userId || profile?.is_subscribed) return
    try {
      setError(null)
      await removeHearts(userId, amount)
      await refreshProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove hearts')
      throw err
    }
  }

  const updateUserSubscription = async (tier: 'pro' | 'family', isTrial: boolean = true) => {
    if (!userId) return
    try {
      setError(null)
      
      // Calculate subscription end date (7 days for trial, 1 month for regular)
      const endDate = new Date()
      if (isTrial) {
        endDate.setDate(endDate.getDate() + 7)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }
      
      const update = {
        is_subscribed: true,
        subscription_tier: tier,
        subscription_status: (isTrial ? 'trialing' : 'active') as 'trialing' | 'active',
        subscription_end_at: endDate.toISOString(),
        stripe_customer_id: `cus_mock_${Math.random().toString(36).substring(7)}`,
        stripe_subscription_id: `sub_mock_${Math.random().toString(36).substring(7)}`,
      }
      const updatedProfile = await updateSubscription(userId, update)
      if (updatedProfile) {
        setProfile(updatedProfile)
      } else {
        throw new Error('Database update returned no data. Check if your table schema is correct.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription')
      throw err
    }
  }

  const claimUserQuestReward = async (questId: string) => {
    if (!userId) return;
    try {
      setError(null);
      const questToClaim = quests.find((q: UserQuest) => q.id === questId);

      if (questToClaim && questToClaim.is_completed && !questToClaim.is_claimed) {
        // Update the quest as claimed in the database
        await supabase
          .from('user_quests')
          .update({ is_claimed: true })
          .eq('id', questId);

        // Add the reward diamonds to the user's profile
        await addDiamonds(userId, questToClaim.quests.reward);

        // Refresh the quests and profile to show the changes
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim quest reward');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      })
      if (error) throw error
    } catch (err) {
      console.error('Password reset error:', err)
      if (err instanceof AuthApiError && err.status === 429) {
        throw new RateLimitError('Too many requests. Please try again in a few minutes.')
      }
      // For other errors, throw a generic message for security
      throw new Error('Failed to send password reset email.')
    }
  }

  const value: UserContextType = {
    user,
    userId,
    isAuthenticated,
    isLoading,
    error,
    profile,
    quests,
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
  updateUserSubscription,
  claimUserQuestReward,
    addStreakFreezer,
    addUserXp,
    resetPassword,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}