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

export interface ChallengeOption {
  id: string
  challenge_id: string
  text: string
  phonetic: string | null
  is_correct: boolean
  audio_src: string | null
  image_src: string | null
  pair_id: number | null
}

export interface Challenge {
  id: string
  lesson_id: string
  type: 'SELECT' | 'ASSIST' | 'SELECT_IMAGE' | 'LISTEN_AND_SELECT' | 'MATCHING'
  instruction: string | null
  question: string
  phonetic: string | null
  order: number
  audio_src?: string | null
  correct_answer?: string | null
  options: ChallengeOption[]
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

// ############# CHALLENGES #############

// Get all challenges for a lesson with options
export async function getChallengesByLesson(lessonId: string): Promise<Challenge[] | null> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('challenges(id, lesson_id, type, instruction, question, phonetic, "order", audio_src, correct_answer, options:challenge_options(id, challenge_id, text, phonetic, is_correct, audio_src, image_src, pair_id))')
      .eq('id', lessonId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }

    if (!data || !data.challenges) return null

    // Sanitize and structure challenges
    const challenges = data.challenges.map((c: any) => ({
      id: c.id,
      lesson_id: c.lesson_id,
      type: c.type,
      instruction: c.instruction,
      question: c.question,
      phonetic: c.phonetic,
      order: c.order,
      audio_src: c.audio_src,
      correct_answer: c.correct_answer,
      options: c.options
        ? c.options.map((o: any) => ({
            id: o.id,
            challenge_id: o.challenge_id,
            text: o.text,
            phonetic: o.phonetic,
            is_correct: o.is_correct,
            audio_src: o.audio_src,
            image_src: o.image_src,
            pair_id: o.pair_id ?? null,
          }))
        : [],
    }))

    return challenges
  } catch (error) {
    console.error('Error fetching challenges for lesson:', error)
    return null
  }
}

// Get all completed lessons for a user with their challenges
export async function getCompletedLessonsWithChallenges(
  userId: string
): Promise<Array<{ lesson: Lesson; challenges: Challenge[] }> | null> {
  try {
    // First get all completed lessons
    const { data: completedLessons, error: progressError } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)

    if (progressError) throw progressError

    if (!completedLessons || completedLessons.length === 0) {
      return []
    }

    const lessonIds = completedLessons.map(p => p.lesson_id)

    // Fetch all lessons with their challenges
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, challenges(id, lesson_id, type, instruction, question, phonetic, "order", audio_src, correct_answer, options:challenge_options(id, challenge_id, text, phonetic, is_correct, audio_src, image_src, pair_id))')
      .in('id', lessonIds)
      .order('order', { ascending: true })

    if (lessonsError) throw lessonsError

    if (!lessonsData) return []

    // Sanitize and structure the data
    const result = lessonsData.map(lesson => ({
      lesson: {
        id: lesson.id,
        unit_id: lesson.unit_id,
        title: lesson.title,
        order: lesson.order,
        audio_src: lesson.audio_src,
        created_at: lesson.created_at,
        completed: true,
      },
      challenges: (lesson.challenges || []).map((c: any) => ({
        id: c.id,
        lesson_id: c.lesson_id,
        type: c.type,
        instruction: c.instruction,
        question: c.question,
        phonetic: c.phonetic,
        order: c.order,
        audio_src: c.audio_src,
        correct_answer: c.correct_answer,
        options: c.options
          ? c.options.map((o: any) => ({
              id: o.id,
              challenge_id: o.challenge_id,
              text: o.text,
              phonetic: o.phonetic,
              is_correct: o.is_correct,
              audio_src: o.audio_src,
              image_src: o.image_src,
              pair_id: o.pair_id ?? null,
            }))
          : [],
      })),
    }))

    return result
  } catch (error) {
    console.error('Error fetching completed lessons with challenges:', error)
    return null
  }
}

// ############# MISTAKES #############

export interface UserMistake {
  id: string
  user_id: string
  challenge_id: string
  lesson_id: string
  created_at: string
}

// Record a user mistake
export async function recordMistake(
  userId: string,
  challengeId: string,
  lessonId: string
): Promise<UserMistake | null> {
  try {
    const { data, error } = await supabase
      .from('user_mistakes')
      .insert([
        {
          user_id: userId,
          challenge_id: challengeId,
          lesson_id: lessonId,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error recording mistake:', error)
    return null
  }
}

// Get all unique mistakes for a user (grouped by challenge)
export async function getUserMistakes(userId: string): Promise<Array<{ challenge: Challenge; lessonId: string; mistakeCount: number }> | null> {
  try {
    const { data: mistakesData, error: mistakesError } = await supabase
      .from('user_mistakes')
      .select('challenge_id, lesson_id')
      .eq('user_id', userId)

    if (mistakesError) throw mistakesError

    if (!mistakesData || mistakesData.length === 0) {
      return []
    }

    // Group mistakes by challenge_id and count them
    const mistakeMap = new Map<string, { count: number; lessonId: string }>()
    mistakesData.forEach(mistake => {
      const key = mistake.challenge_id
      if (mistakeMap.has(key)) {
        const current = mistakeMap.get(key)!
        current.count += 1
      } else {
        mistakeMap.set(key, { count: 1, lessonId: mistake.lesson_id })
      }
    })

    // Fetch all unique challenges with their details
    const challengeIds = Array.from(mistakeMap.keys())
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('id, lesson_id, type, instruction, question, phonetic, "order", audio_src, correct_answer, options:challenge_options(id, challenge_id, text, phonetic, is_correct, audio_src, image_src, pair_id)')
      .in('id', challengeIds)

    if (challengesError) throw challengesError

    if (!challengesData) return []

    // Combine challenge data with mistake counts
    const result = challengesData.map((c: any) => {
      const mistakeInfo = mistakeMap.get(c.id)!
      return {
        challenge: {
          id: c.id,
          lesson_id: c.lesson_id,
          type: c.type,
          instruction: c.instruction,
          question: c.question,
          phonetic: c.phonetic,
          order: c.order,
          audio_src: c.audio_src,
          correct_answer: c.correct_answer,
          options: c.options
            ? c.options.map((o: any) => ({
                id: o.id,
                challenge_id: o.challenge_id,
                text: o.text,
                phonetic: o.phonetic,
                is_correct: o.is_correct,
                audio_src: o.audio_src,
                image_src: o.image_src,
                pair_id: o.pair_id ?? null,
              }))
            : [],
        } as Challenge,
        lessonId: mistakeInfo.lessonId,
        mistakeCount: mistakeInfo.count,
      }
    })

    return result
  } catch (error) {
    console.error('Error fetching user mistakes:', error)
    return null
  }
}

// Clear all mistakes for a user
export async function clearUserMistakes(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_mistakes')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error clearing user mistakes:', error)
    return false
  }
}