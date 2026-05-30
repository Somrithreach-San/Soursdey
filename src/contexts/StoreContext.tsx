import { createContext, useContext, useState, ReactNode } from 'react'
import {
  getAllStoreItems,
  getStoreItemsByType,
  getUserInventory,
  purchaseStoreItem,
  useStoreItem,
  type StoreItem,
  type UserInventory,
} from '../services'
import { useUser } from './UserContext'

interface StoreContextType {
  // Data
  storeItems: StoreItem[] | null
  userInventory: UserInventory[] | null
  isLoading: boolean
  error: string | null

  // Functions
  fetchStoreItems: () => Promise<void>
  fetchStoreItemsByType: (type: 'heart' | 'diamond' | 'power-up') => Promise<StoreItem[] | null>
  fetchUserInventory: () => Promise<void>
  buyItem: (storeItemId: string, quantity?: number) => Promise<void>
  consumeItem: (storeItemId: string) => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser()
  const [storeItems, setStoreItems] = useState<StoreItem[] | null>(null)
  const [userInventory, setUserInventory] = useState<UserInventory[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStoreItems = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const data = await getAllStoreItems()
      setStoreItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store items')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStoreItemsByType = async (
    type: 'heart' | 'diamond' | 'power-up'
  ): Promise<StoreItem[] | null> => {
    try {
      setError(null)
      setIsLoading(true)
      const data = await getStoreItemsByType(type)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store items')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInventory = async () => {
    if (!userId) return
    try {
      setError(null)
      setIsLoading(true)
      const data = await getUserInventory(userId)
      setUserInventory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
    } finally {
      setIsLoading(false)
    }
  }

  const buyItem = async (storeItemId: string, quantity: number = 1) => {
    if (!userId) return
    try {
      setError(null)
      const purchased = await purchaseStoreItem(userId, storeItemId, quantity)
      if (purchased && userInventory) {
        const existing = userInventory.find((i) => i.store_item_id === storeItemId)
        if (existing) {
          setUserInventory((prev) =>
            prev
              ? prev.map((i) =>
                  i.store_item_id === storeItemId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                )
              : [purchased]
          )
        } else {
          setUserInventory((prev) => (prev ? [...prev, purchased] : [purchased]))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase item')
      throw err
    }
  }

  const consumeItem = async (storeItemId: string) => {
    if (!userId) return
    try {
      setError(null)
      const remaining = await useStoreItem(userId, storeItemId)
      if (remaining !== null && userInventory) {
        if (remaining === 0) {
          setUserInventory((prev) =>
            prev ? prev.filter((i) => i.store_item_id !== storeItemId) : null
          )
        } else {
          setUserInventory((prev) =>
            prev
              ? prev.map((i) =>
                  i.store_item_id === storeItemId ? { ...i, quantity: remaining } : i
                )
              : null
          )
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consume item')
      throw err
    }
  }

  const value: StoreContextType = {
    storeItems,
    userInventory,
    isLoading,
    error,
    fetchStoreItems,
    fetchStoreItemsByType,
    fetchUserInventory,
    buyItem,
    consumeItem,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}
