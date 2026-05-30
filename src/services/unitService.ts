import { supabase } from '../lib/supabase'

export interface Unit {
  id: string
  title: string
  section: number
  unit: number
  color: string
  dark_color: string
  light_color: string
  created_at: string
}

export interface Lesson {
  id: string
  unit_id: string
  title: string
  order: number
  audio_src: string | null
  created_at: string
  completed?: boolean // This can be added dynamically
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
}

export interface UserProgress {
  id: string
  user_id: string
  unit_id: string
  completed: boolean
  progress_percentage: number
  last_accessed: string
}

// ############# LESSON PROGRESS #############

// Get all lesson progress for a user
export async function getLessonProgress(userId: string): Promise<LessonProgress[] | null> {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return null
  }
}

// Complete a lesson for a user
export async function completeLesson(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  try {
    // First, try to find an existing record
    const { data: existing, error: findError } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw findError;
    }

    // If a record exists, update it. Otherwise, insert a new one.
    if (existing) {
      const { data, error } = await supabase
        .from('lesson_progress')
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert([
          {
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error completing lesson:', error);
    return null;
  }
}

// ############# UNIT PROGRESS #############

// Get all units
export async function getAllUnits(): Promise<Unit[] | null> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('section', { ascending: true })
      .order('unit', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching units:', error)
    return null
  }
}

// Get unit by ID
export async function getUnitById(unitId: string): Promise<Unit | null> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching unit:', error)
    return null
  }
}

// Get all lessons for a unit
export async function getLessonsByUnit(unitId: string): Promise<Lesson[] | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .order('order', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching lessons for unit:', error)
    return null
  }
}

// Get user progress for a unit
export async function getUserProgressByUnit(
  userId: string,
  unitId: string
): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('unit_id', unitId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
    return data || null
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return null
  }
}

// Get all user progress
export async function getUserProgress(userId: string): Promise<UserProgress[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching all user progress:', error)
    return null
  }
}

// Create user progress
export async function createUserProgress(
  userId: string,
  unitId: string
): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          unit_id: unitId,
          completed: false,
          progress_percentage: 0,
          last_accessed: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user progress:', error)
    return null
  }
}

// Update user progress
export async function updateUserProgress(
  userId: string,
  unitId: string,
  updates: Partial<Omit<UserProgress, 'id' | 'user_id' | 'unit_id'>>
): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('unit_id', unitId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user progress:', error)
    return null
  }
}

// Complete unit
export async function completeUnit(userId: string, unitId: string): Promise<UserProgress | null> {
  return updateUserProgress(userId, unitId, {
    completed: true,
    progress_percentage: 100,
    last_accessed: new Date().toISOString(),
  })
}

// Update progress percentage
export async function updateProgressPercentage(
  userId: string,
  unitId: string,
  percentage: number
): Promise<UserProgress | null> {
  return updateUserProgress(userId, unitId, {
    progress_percentage: Math.min(100, Math.max(0, percentage)),
    last_accessed: new Date().toISOString(),
  })
}