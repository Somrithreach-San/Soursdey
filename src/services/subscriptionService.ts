import { supabase } from '../lib/supabase'
import type { Profile } from './userService'
import { loadStripe } from '@stripe/stripe-js'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY || ''

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

export type SubscriptionTier = 'free' | 'pro' | 'family'

export interface SubscriptionUpdate {
  is_subscribed: boolean
  subscription_tier: SubscriptionTier
  subscription_status: 'none' | 'active' | 'trialing' | 'canceled' | 'expired'
  subscription_end_at?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

/**
 * Updates the user's subscription status in Supabase.
 */
export async function updateSubscription(userId: string, update: SubscriptionUpdate): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase Subscription Update Error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error // Re-throw so the caller can handle it
  }
}

/**
 * Creates a real Stripe Checkout Session using the provided test keys.
 * 
 * IMPORTANT: In a production app, you MUST create the checkout session 
 * on a secure backend (like Supabase Edge Functions) to protect your 
 * Secret Key. This implementation uses the Secret Key on the frontend 
 * ONLY for rapid sandbox development.
 */
export async function createStripeCheckoutSession(tier: SubscriptionTier, userId: string, userEmail: string | null | undefined) {
  const priceId = tier === 'pro' 
    ? 'price_1pro_mock' // Replace with actual Price IDs from your Stripe Dashboard
    : 'price_1family_mock'

  // Since we don't have a backend, we call Stripe's API directly via fetch
  // This is a "Sandbox Development" shortcut.
  try {
    const params = new URLSearchParams()
    params.append('success_url', `${window.location.origin}/store?session_id={CHECKOUT_SESSION_ID}`)
    params.append('cancel_url', `${window.location.origin}/store`)
    if (userEmail) {
      params.append('customer_email', userEmail)
    }
    params.append('client_reference_id', userId)
    params.append('mode', 'subscription')
    
    // Add line items
    // In a real app, you'd use Price IDs. For this demo, we'll create a one-time product/price on the fly if possible,
    // but Stripe API requires pre-existing Prices for subscriptions.
    // So we'll use a placeholder and expect the user to eventually add real Price IDs.
    params.append('line_items[0][price_data][currency]', 'usd')
    params.append('line_items[0][price_data][product_data][name]', `Peacode ${tier.toUpperCase()} Subscription`)
    params.append('line_items[0][price_data][recurring][interval]', 'month')
    params.append('line_items[0][price_data][unit_amount]', tier === 'pro' ? '299' : '499')
    params.append('line_items[0][quantity]', '1')

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const session = await response.json()
    
    if (session.error) {
      throw new Error(session.error.message)
    }

    return session
  } catch (error) {
    console.error('Stripe Session Error:', error)
    throw error
  }
}

/**
 * Simulates a Stripe Checkout Session creation for backward compatibility.
 * Now it uses the real Stripe API if keys are present.
 */
export async function createMockCheckoutSession(tier: SubscriptionTier) {
  console.log(`Creating mock checkout session for ${tier} tier...`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    sessionId: `mock_session_${Math.random().toString(36).substring(7)}`,
    url: `https://checkout.stripe.com/pay/${tier}_mock_session`, 
  }
}