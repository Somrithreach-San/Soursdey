import { createContext, useContext, useState, type ReactNode, useCallback } from 'react'
import {
  getAllUnits,
  getUserProgress,
  getLessonsByUnit,
  getLessonProgress,
  updateProgressPercentage, // Re-add this import
  completeLesson as completeLessonService,
  type Unit,
  type Lesson,
  type UserProgress,
  type LessonProgress,
} from '../services'
import { useUser } from './UserContext'

interface LessonContextType {
  // Data
  units: Unit[] | null
  lessons: Lesson[] | null
  lessonProgress: LessonProgress[] | null
  userProgress: UserProgress[] | null
  loadingStates: LoadingStates;
  error: string | null

  // Functions
  fetchUnits: () => Promise<void>
  fetchLessons: (unitsToFetch: Unit[]) => Promise<void>
  fetchUserProgress: () => Promise<void>
  fetchLessonProgress: () => Promise<void>
  getUnitProgress: (unitId: string) => UserProgress | null
  completeLesson: (lessonId: string) => Promise<void>
  updateUnitProgress: (unitId: string, percentage: number) => Promise<void>
}

interface LoadingStates {
  units: boolean
  lessons: boolean
  progress: boolean
  lessonProgress: boolean
}

const initialLoadingStates: LoadingStates = {
  units: false,
  lessons: false,
  progress: false,
  lessonProgress: false,
}

const LessonContext = createContext<LessonContextType | undefined>(undefined)

export function LessonProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser()
  const [units, setUnits] = useState<Unit[] | null>(null)
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[] | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[] | null>(null)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>(initialLoadingStates)
  const [error, setError] = useState<string | null>(null)

  const fetchUnits = useCallback(async () => {
    try {
      setError(null)
      setLoadingStates(prev => ({ ...prev, units: true }))
      const data = await getAllUnits()
      setUnits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch units')
    } finally {
      setLoadingStates(prev => ({ ...prev, units: false }))
    }
  }, [])

  const fetchLessons = useCallback(async (unitsToFetch: Unit[]) => {
    try {
      setError(null)
      setLoadingStates(prev => ({ ...prev, lessons: true }))

      const lessonPromises = unitsToFetch.map(unit => getLessonsByUnit(unit.id))
      const lessonsByUnit = await Promise.all(lessonPromises)
      
      const allLessons = lessonsByUnit.filter(Boolean).flat() as Lesson[]
      
      setLessons(allLessons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons')
    } finally {
      setLoadingStates(prev => ({ ...prev, lessons: false }))
    }
  }, [])

  const fetchUserProgress = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      setLoadingStates(prev => ({ ...prev, progress: true }))
      const data = await getUserProgress(userId)
      setUserProgress(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
    } finally {
      setLoadingStates(prev => ({ ...prev, progress: false }))
    }
  }, [userId])

  const fetchLessonProgress = useCallback(async () => {
    if (!userId) return
    try {
      setError(null)
      setLoadingStates(prev => ({ ...prev, lessonProgress: true }))
      const data = await getLessonProgress(userId)
      setLessonProgress(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson progress')
    } finally {
      setLoadingStates(prev => ({ ...prev, lessonProgress: false }))
    }
  }, [userId])

  const getUnitProgress = useCallback((unitId: string): UserProgress | null => {
    if (!userProgress) return null
    return userProgress.find((p) => p.unit_id === unitId) || null
  }, [userProgress])

  const completeLesson = useCallback(async (lessonId: string) => {
    if (!userId) return
    try {
      setError(null)
      const completed = await completeLessonService(userId, lessonId)
      if (completed) {
        // Immediately re-fetch the progress to ensure the UI is up-to-date
        await fetchLessonProgress();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete lesson')
      throw err
    }
  }, [userId, fetchLessonProgress])

  const updateUnitProgress = useCallback(async (unitId: string, percentage: number) => {
    if (!userId) return
    try {
      setError(null)
      const updated = await updateProgressPercentage(userId, unitId, percentage)
      if (updated && userProgress) {
        setUserProgress((prev) =>
          prev
            ? prev.map((p) => (p.unit_id === unitId ? updated : p))
            : [updated]
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      throw err
    }
  }, [userId, userProgress])

  const value: LessonContextType = {
    units,
    lessons,
    lessonProgress,
    userProgress,
    loadingStates,
    error,
    fetchUnits,
    fetchLessons,
    fetchUserProgress,
    fetchLessonProgress,
    getUnitProgress,
    completeLesson,
    updateUnitProgress,
  }

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>
}

export function useLesson() {
  const context = useContext(LessonContext)
  if (!context) {
    throw new Error('useLesson must be used within LessonProvider')
  }
  return context
}