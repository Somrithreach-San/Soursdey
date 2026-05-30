import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  streak: number
  diamonds: number
  hearts: number
  created_at: string
}

// Get user profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

// Increment streak
export async function incrementStreak(userId: string): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const { data, error } = await supabase
      .from('profiles')
      .update({ streak: profile.streak + 1 })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data?.streak
  } catch (error) {
    console.error('Error incrementing streak:', error)
    return null
  }
}

// Add diamonds
export async function addDiamonds(userId: string, amount: number): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const { data, error } = await supabase
      .from('profiles')
      .update({ diamonds: profile.diamonds + amount })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data?.diamonds
  } catch (error) {
    console.error('Error adding diamonds:', error)
    return null
  }
}

// Remove diamonds
export async function removeDiamonds(userId: string, amount: number): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const newAmount = Math.max(0, profile.diamonds - amount)
    const { data, error } = await supabase
      .from('profiles')
      .update({ diamonds: newAmount })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data?.diamonds
  } catch (error) {
    console.error('Error removing diamonds:', error)
    return null
  }
}

// Add hearts
export async function addHearts(userId: string, amount: number): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const { data, error } = await supabase
      .from('profiles')
      .update({ hearts: profile.hearts + amount })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data?.hearts
  } catch (error) {
    console.error('Error adding hearts:', error)
    return null
  }
}

// Remove hearts
export async function removeHearts(userId: string, amount: number): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const newAmount = Math.max(0, profile.hearts - amount)
    const { data, error } = await supabase
      .from('profiles')
      .update({ hearts: newAmount })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data?.hearts
  } catch (error) {
    console.error('Error removing hearts:', error)
    return null
  }
}

// Create profile (used after auth signup)
export async function createProfile(userId: string, username: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          streak: 0,
          diamonds: 0,
          hearts: 5,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating profile:', error)
    return null
  }
}
