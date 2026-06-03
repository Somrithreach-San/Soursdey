import { supabase } from '../lib/supabase'
import { calculateHeartsToRegenerate, MAX_HEARTS, HEART_REGENERATION_TIME } from '../lib/hearts'

export interface Profile {
  id: string
  username: string
  email: string | null
  avatar_url?: string
  streak: number
  diamonds: number
  hearts: number
  xp: number
  created_at: string
  last_heart_update: string
  last_streak_update?: string
  streak_dates?: string[] // Array of ISO dates where the user maintained their streak
  streak_freezer_uses?: number // Number of streak freezers remaining in inventory
  is_subscribed: boolean
  subscription_tier: 'free' | 'pro' | 'family'
  subscription_status: 'none' | 'active' | 'trialing' | 'canceled' | 'expired'
  subscription_end_at?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  icon: string;
}

export interface UserQuest {
  id: string; // This is the user_quest ID
  progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  quests: Quest; // This will be the joined Quest object
}


// Create profile (used after auth signup)
export async function createProfile(userId: string, username: string, email: string): Promise<Profile | null> {
  try {
    const defaultAvatars = [
      'Jason.png',
      'Lily.png',
      'Linda.png',
      'Mark.png',
      'Marry.png',
    ];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username, // Use username derived from email
          email,
          avatar_url: randomAvatar, // Assign random default avatar
          streak: 0,
          diamonds: 10,
          hearts: 5,
          xp: 0,
          is_subscribed: false,
          subscription_tier: 'free',
          subscription_status: 'none',
          created_at: new Date().toISOString(),
          last_heart_update: new Date().toISOString(),
          last_streak_update: null,
          streak_dates: [],
        },
      ])
      .select()
      .single()

    if (error) throw error;

    // After creating the profile, assign the default quests and wait for it to complete
    await assignDefaultQuests(userId);

    return data

  } catch (error) {
    console.error('Error creating profile:', error)
     return null
}

}

// Get user profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // If profile doesn't exist, try to create it (self-healing)
      if (error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.id === userId) {
          const defaultUsername = user.email?.split('@')[0] || 'user'
          return await createProfile(userId, defaultUsername, user.email || '')
        }
      }
      throw error
    }
    
    // Handle heart regeneration
    const { heartsToAdd, needsUpdate } = calculateHeartsToRegenerate(data.hearts, data.last_heart_update);

    // Check if subscription has expired
    let isSubscribed = data.is_subscribed;
    let subscriptionStatus = data.subscription_status;
    let subscriptionTier = data.subscription_tier;
    let subscriptionNeedsUpdate = false;

    if (data.is_subscribed && data.subscription_end_at) {
      const now = new Date();
      const endAt = new Date(data.subscription_end_at);
      if (now > endAt) {
        console.log('Subscription expired! Reverting to free tier.');
        isSubscribed = false;
        subscriptionStatus = 'expired';
        subscriptionTier = 'free';
        subscriptionNeedsUpdate = true;
      }
    }

    if ((needsUpdate && heartsToAdd > 0) || subscriptionNeedsUpdate) {
      const newHeartCount = needsUpdate ? Math.min(data.hearts + heartsToAdd, MAX_HEARTS) : data.hearts;
      const newLastHeartUpdate = needsUpdate 
        ? new Date(new Date(data.last_heart_update).getTime() + heartsToAdd * HEART_REGENERATION_TIME).toISOString()
        : data.last_heart_update;

      const updates: any = {
        hearts: newHeartCount,
        last_heart_update: newLastHeartUpdate
      };

      if (subscriptionNeedsUpdate) {
        updates.is_subscribed = isSubscribed;
        updates.subscription_status = subscriptionStatus;
        updates.subscription_tier = subscriptionTier;
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (!updateError && updatedData) {
        return updatedData;
      }
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Add XP to user profile
export async function addXp(userId: string, amount: number): Promise<number | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const newXp = (profile.xp || 0) + amount
    const { data, error } = await supabase
      .from('profiles')
      .update({ xp: newXp })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data.xp
  } catch (error) {
    console.error('Error adding XP:', error)
    return null
  }
}

// Get all profiles for leaderboard
export async function getLeaderboardProfiles(): Promise<Profile[]> {
  try {
    // Try to order by XP first
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false })

    if (error) {
      console.warn('Could not sort by XP (it might not exist in DB yet), falling back to diamonds:', error.message)
      // Fallback to diamonds if XP column doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('*')
        .order('diamonds', { ascending: false })
      
      if (fallbackError) throw fallbackError
      return fallbackData || []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching leaderboard profiles:', error)
    return []
  }
}

// Keep track of user IDs currently undergoing quest assignment to prevent concurrent race conditions
const assigningQuestsUsers = new Set<string>();

// Assigns default quests to a new user
export async function assignDefaultQuests(userId: string): Promise<void> {
  if (assigningQuestsUsers.has(userId)) {
    console.log(`Already assigning quests for user ${userId}. Skipping duplicate call.`);
    return;
  }

  assigningQuestsUsers.add(userId);

  try {
    // First, check if the user already has any quests assigned today.
    const { data: existingUserQuests, error: existingQuestsError } = await supabase
      .from('user_quests')
      .select('id, assigned_at')
      .eq('user_id', userId)
      .limit(1);

    if (existingQuestsError && existingQuestsError.code !== 'PGRST116') {
      console.error('Error checking for existing user quests:', existingQuestsError);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If quests already exist and were assigned today, don't reassign
    if (existingUserQuests && existingUserQuests.length > 0) {
      const lastAssigned = new Date(existingUserQuests[0].assigned_at);
      lastAssigned.setHours(0, 0, 0, 0);
      
      if (lastAssigned.getTime() === today.getTime()) {
        console.log(`User ${userId} already has quests for today. Skipping default quest assignment.`);
        return;
      }
    }

    // 1. Fetch default quests from the master 'quests' table
    const { data: defaultQuests, error: fetchError } = await supabase
      .from('quests')
      .select('id, title')
      .eq('is_default', true);

    if (fetchError) throw fetchError;
    if (!defaultQuests || defaultQuests.length === 0) return;

    // 2. Prepare the records for the 'user_quests' table with assigned_at timestamp
    const userQuestsToInsert = defaultQuests.map(quest => {
      // The 'Daily Login' quest is completed by default on signup
      const isCompleted = quest.title === 'Daily Login';
      return {
        user_id: userId,
        quest_id: quest.id,
        progress: isCompleted ? 1 : 0,
        is_completed: isCompleted,
        is_claimed: false,
        assigned_at: new Date().toISOString() // Add timestamp
      };
    });

    // 3. Insert the new records
    const { error: insertError } = await supabase
      .from('user_quests')
      .insert(userQuestsToInsert);

    if (insertError) throw insertError;
    console.log(`Successfully assigned ${userQuestsToInsert.length} default quests to user ${userId}`);

  } catch (error) {
    console.error('Error assigning default quests:', error);
  } finally {
    assigningQuestsUsers.delete(userId);
  }
}

// Get all quests for a specific user
export async function getUserQuests(userId: string): Promise<UserQuest[]> {
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select(`
        id,
        progress,
        is_completed,
        is_claimed,
        quests (
          id,
          title,
          description,
          target,
          reward,
          icon
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    
    // TypeScript's inference can be incorrect for nested joins. Casting to 'unknown' first
    // assures the compiler that the shape is correct at runtime.
    return data as unknown as UserQuest[];

  } catch (error) {
    console.error('Error fetching user quests:', error);
    return [];
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

// Add streak freezer to user's inventory
export async function addStreakFreezer(userId: string, quantity: number = 1): Promise<Profile | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null
    
    const currentFreezers = profile.streak_freezer_uses || 0
    const newFreezers = currentFreezers + quantity
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ streak_freezer_uses: newFreezers })
      .eq('id', userId)
      .select()
      .single()
      
    if (error) throw error
    console.log(`Added ${quantity} streak freezer(s). Total now: ${newFreezers}`)
    return data
  } catch (error) {
    console.error('Error adding streak freezer:', error)
    return null
  }
}

// Refresh daily quests - clears old quests and assigns new ones if a new day has started
export async function refreshDailyQuests(userId: string): Promise<void> {
  try {
    // Check if user has any existing quests
    const { data: userQuests, error: fetchError } = await supabase
      .from('user_quests')
      .select('assigned_at')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking quest assignment date:', fetchError);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If user has no quests, or quests were assigned before today, refresh them
    if (!userQuests) {
      console.log('User has no quests, assigning default quests...');
      await assignDefaultQuests(userId);
    } else {
      const lastAssigned = new Date(userQuests.assigned_at);
      lastAssigned.setHours(0, 0, 0, 0);
      
      if (lastAssigned.getTime() < today.getTime()) {
        console.log('New day detected! Refreshing daily quests...');
        // Delete all old user quests
        const { error: deleteError } = await supabase
          .from('user_quests')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) throw deleteError;
        
        // Assign fresh daily quests
        await assignDefaultQuests(userId);
        console.log('Daily quests refreshed successfully!');
      } else {
        console.log('Quests are already up to date for today');
      }
    }
  } catch (error) {
    console.error('Error refreshing daily quests:', error);
  }
}

// Increment streak with proper consecutive day logic
export async function incrementStreak(userId: string): Promise<{ newStreak: number; streakChanged: boolean } | null> {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    // Get today's date at midnight for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get last streak update date at midnight, if it exists.
    const lastUpdate = profile.last_streak_update ? new Date(profile.last_streak_update) : null
    if (lastUpdate) lastUpdate.setHours(0, 0, 0, 0)

    // Calculate yesterday's date
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = profile.streak
    let streakChanged = false

    if (lastUpdate && lastUpdate.getTime() === today.getTime()) {
      // Already updated streak today - do nothing
      console.log('Streak already updated today')
      return { newStreak, streakChanged: false }
    } else if (lastUpdate && lastUpdate.getTime() === yesterday.getTime()) {
      // Consecutive day - increment streak
      newStreak = profile.streak + 1
      streakChanged = true
      console.log('Consecutive day! New streak:', newStreak)
    } else {
      // Check if we have any streak freezers to use
      const hasStreakFreezer = profile.streak_freezer_uses && profile.streak_freezer_uses > 0;
      
      if (hasStreakFreezer) {
        // Use a streak freezer to protect the streak
        console.log('Using streak freezer to protect streak!')
        newStreak = profile.streak + 1
        streakChanged = true
        // Decrement streak freezer count
        const newFreezerUses = (profile.streak_freezer_uses || 1) - 1;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            streak_freezer_uses: newFreezerUses
          })
          .eq('id', userId)
          .single()
          
        if (updateError) throw updateError
        console.log('Streak freezer used! Remaining:', newFreezerUses)
      } else {
        // First streak day or missed a day and no streak freezer - set streak to 1
        newStreak = 1
        streakChanged = true
        console.log('Streak updated/reset to:', newStreak)
      }
    }

    // Only update database if streak changed
    if (streakChanged) {
      // Add today's date to streak_dates array in local timezone
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const todayStr = `${year}-${month}-${day}`
      
      const currentStreakDates = profile.streak_dates || []
      const updatedStreakDates = [...currentStreakDates.filter(d => d !== todayStr), todayStr]
      
      const updates: any = { 
        streak: newStreak, 
        last_streak_update: new Date().toISOString(),
        streak_dates: updatedStreakDates
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
        
      if (error) throw error
      console.log('Streak updated successfully:', newStreak)
    }

    return { newStreak, streakChanged }
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