import { supabase } from '../lib/supabase'

export interface StoreItem {
  id: string
  title: string
  description: string
  cost: number
  type: 'heart' | 'diamond' | 'power-up'
  icon_url?: string
  created_at: string
}

export interface UserInventory {
  id: string
  user_id: string
  store_item_id: string
  quantity: number
  purchased_at: string
}

// Get all store items
export async function getAllStoreItems(): Promise<StoreItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching store items:', error)
    return null
  }
}

// Get user inventory
export async function getUserInventory(userId: string): Promise<UserInventory[] | null> {
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user inventory:', error)
    return null
  }
}

// Get user inventory item quantity
export async function getUserInventoryQuantity(
  userId: string,
  storeItemId: string
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', userId)
      .eq('store_item_id', storeItemId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.quantity || 0
  } catch (error) {
    console.error('Error fetching inventory quantity:', error)
    return null
  }
}

// Purchase store item
export async function purchaseStoreItem(
  userId: string,
  storeItemId: string,
  quantity: number = 1
): Promise<UserInventory | null> {
  try {
    // Check if item already in inventory
    const existing = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('store_item_id', storeItemId)
      .single()

    if (existing.data) {
      // Update quantity
      const { data, error } = await supabase
        .from('user_inventory')
        .update({ quantity: existing.data.quantity + quantity })
        .eq('user_id', userId)
        .eq('store_item_id', storeItemId)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new inventory item
      const { data, error } = await supabase
        .from('user_inventory')
        .insert([
          {
            user_id: userId,
            store_item_id: storeItemId,
            quantity,
            purchased_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error purchasing store item:', error)
    return null
  }
}
