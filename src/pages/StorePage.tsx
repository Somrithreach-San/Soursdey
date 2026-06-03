import { useState, useEffect, useContext } from 'react'
import { Check, X, CreditCard, ShieldCheck, Zap, Infinity as InfinityIcon } from 'lucide-react'
import { cn, getDaysRemaining } from '../lib/utils'
import { motion } from 'framer-motion'
import { useStore, useUser } from '../contexts'
import hearts from '../assets/hearts.png'
import diamond from '../assets/diamond.png'
import ice from '../assets/ice.png'
import { Loader } from '../components/ui/Loader'
import { createMockCheckoutSession, createStripeCheckoutSession } from '../services'

interface FeatureListProps {
  features: { label: string; included: boolean }[]
  isSelected?: boolean
}

const FeatureList = ({ features, isSelected }: FeatureListProps) => (
  <div className="flex flex-col gap-3.5 items-center w-full">
    <div className="flex flex-col gap-3.5 items-start">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-3.5">
          {feature.included ? (
            <Check className={cn("w-4 h-4 shrink-0 mt-0.5", isSelected ? "text-duo-green" : "text-duo-green")} strokeWidth={4} />
          ) : (
            <X className={cn("w-4 h-4 shrink-0 mt-0.5", isSelected ? "text-duo-red" : "text-duo-red/60")} strokeWidth={4} />
          )}
          <span className={cn(
            "font-bold text-[13px] leading-tight pt-px transition-colors duration-500",
            isSelected ? "text-gray-800" : "text-white"
          )}>
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const StoreItem = ({ icon, title, description, cost, costIcon, children }: { icon: string, title: string, description: string, cost: string, costIcon?: string, children?: React.ReactNode }) => (
  <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-duo-dark border-2 border-duo-border rounded-2xl hover:bg-white/5 transition-all shadow-[0_4px_0_0_#37464f] active:translate-y-0.5 active:shadow-none">
    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0">
      <img src={icon} alt={title} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-white text-base md:text-lg truncate">{title}</h3>
      <p className="text-duo-gray text-xs md:text-sm font-bold leading-tight">{description}</p>
    </div>
    <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
      <div className="flex items-center gap-1.5">
        <span className="font-black text-duo-blue uppercase tracking-widest text-[10px] md:text-sm">{cost}</span>
        {costIcon && <img src={costIcon} alt="cost" className="w-3.5 h-3.5 md:w-4 md:h-4 object-contain" />}
      </div>
      {children}
    </div>
  </div>
)

export const StorePage = () => {
  const { storeItems, fetchStoreItems, buyItem } = useStore()
  const { profile, removeUserDiamonds, addUserHearts, refreshProfile, addStreakFreezer, updateUserSubscription } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'family'>('pro')
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false)
  const [purchaseCost, setPurchaseCost] = useState(0)
  const [successDetails, setSuccessDetails] = useState({ title: '', message: '', newHearts: 0, newDiamonds: 0 })

  useEffect(() => {
    if (profile?.is_subscribed) {
      setSelectedPlan(profile.subscription_tier)
    }
  }, [profile])

  useEffect(() => {
    fetchStoreItems()
  }, [])

  useEffect(() => {
    // Check for Stripe success session_id - ONLY if we have a profile/userId
    if (profile?.id) {
      const query = new URLSearchParams(window.location.search)
      const sessionId = query.get('session_id')
      if (sessionId) {
        handleStripeSuccess(sessionId)
      }
    }
  }, [profile?.id])

  const handleStripeSuccess = async (sessionId: string) => {
    // In a real app, you would verify the session on the backend.
    // For this sandbox, we'll assume success if we return with a session_id.
    setIsProcessingSubscription(true)
    try {
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname)
      
      // We can't easily get the tier from the session_id on the frontend without a backend call,
      // but we can check what the user last selected or just default to 'pro' for the demo.
      // Better: we can look at the session details if we use the secret key (dangerous but okay for sandbox).
      
      const tier = (localStorage.getItem('pending_subscription_tier') as 'pro' | 'family') || 'pro'
      const isTrial = true // For now, we assume all new signups from this page are trials as per UI
      
      await updateUserSubscription(tier, isTrial)
      
      setSuccessDetails({
        title: isTrial ? 'Trial Started!' : 'Subscription Active!',
        message: isTrial 
          ? `Your 1-week free trial of Soursdey ${tier.toUpperCase()} has started! You won't be charged until the trial ends.`
          : `Welcome to Soursdey ${tier.toUpperCase()}! Your premium features are now active.`,
        newHearts: profile?.hearts || 0,
        newDiamonds: profile?.diamonds || 0
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Finalizing subscription failed:', err)
      alert(`Subscription Activation Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessingSubscription(false)
    }
  }

  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSuccessModal]);

  // Handle subscription checkout
  const handleSubscriptionCheckout = async () => {
    if (selectedPlan === 'free' || !profile) return
    
    setIsProcessingSubscription(true)
    try {
      // Store the tier in localStorage so we know what to activate on return
      localStorage.setItem('pending_subscription_tier', selectedPlan)
      
      // Create real Stripe checkout session
      const session = await createStripeCheckoutSession(selectedPlan, profile.id, profile.email)
      
      if (session.url) {
        // Redirect to real Stripe Checkout
        window.location.href = session.url
      } else {
        throw new Error('Failed to create checkout session URL')
      }
    } catch (err) {
      console.error('Subscription failed:', err)
      alert(`Stripe Error: ${err instanceof Error ? err.message : 'Failed to start checkout'}`)
    } finally {
      setIsProcessingSubscription(false)
    }
  }

  const freeFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: false },
    { label: 'Skills practice', included: false },
    { label: 'Mistakes review', included: false },
    { label: 'No ads', included: false },
  ]

  const proFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: true },
    { label: 'Skills practice', included: true },
    { label: 'Mistakes review', included: true },
    { label: 'No ads', included: true },
  ]

  const familyFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: true },
    { label: 'Skills practice', included: true },
    { label: 'Mistakes review', included: true },
    { label: 'No ads', included: true },
    { label: 'Up to 3 accounts', included: true },
  ]

  // Handle purchases
  const purchaseHeartRefill = async (item: any, heartsToAdd: number, isRefill: boolean) => {
    if (!profile || (profile.diamonds || 0) < item.cost) {
      alert('Not enough gems!')
      return
    }
    // Can't have more than 5 hearts
    const currentHearts = profile.hearts || 0
    if (currentHearts >= 5 && isRefill) {
      alert('You already have full hearts!')
      return
    }

    setIsPurchasing(item.id)
    try {
      await removeUserDiamonds(item.cost)
      const heartsToActuallyAdd = isRefill ? Math.min(heartsToAdd, 5 - currentHearts) : heartsToAdd;
      await addUserHearts(heartsToActuallyAdd)
      await refreshProfile()
      const newHeartCount = currentHearts + heartsToActuallyAdd
      const newDiamondCount = (profile?.diamonds || 0) - item.cost
      setPurchaseCost(item.cost)
      setSuccessDetails({
        title: 'Purchase Successful!',
        message: `You added ${heartsToActuallyAdd} heart${heartsToActuallyAdd > 1 ? 's' : ''}!`,
        newHearts: newHeartCount,
        newDiamonds: newDiamondCount
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Purchase failed:', err)
      alert('Purchase failed, please try again.')
    } finally {
      setIsPurchasing(null)
    }
  }

  // Handle streak freezer purchase
  const purchaseStreakFreezer = async (item: any) => {
    if (!profile || (profile.diamonds || 0) < item.cost) {
      alert('Not enough gems!')
      return
    }
    setIsPurchasing(item.id)
    try {
      // Remove diamonds from user's balance
      await removeUserDiamonds(item.cost)
      // Add streak freezer to user's profile
      await addStreakFreezer(1)
      // Also add to inventory using store system
      await buyItem(item.id)
      await refreshProfile()
      
      const newDiamondCount = (profile?.diamonds || 0) - item.cost
      const currentFreezers = profile?.streak_freezer_uses || 0
      setPurchaseCost(item.cost)
      setSuccessDetails({
        title: 'Purchase Successful!',
        message: `You added 1 Streak Freezer! You now have ${currentFreezers + 1} streak freezer(s).`,
        newHearts: profile?.hearts || 0,
        newDiamonds: newDiamondCount
      })
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Streak freezer purchase failed:', err)
      alert('Purchase failed, please try again.')
    } finally {
      setIsPurchasing(null)
    }
  }

  // Group store items by type
  const heartItems = storeItems?.filter(item => item.type === 'heart') || []
  const powerUpItems = storeItems?.filter(item => item.type === 'power-up') || []


  return (
    <div className="min-h-screen py-12 flex flex-col items-center relative max-w-4xl mx-auto px-4">
      {/* Subscription Section (Now at Top) */}
      <div className="w-full mb-16">
        <div className="flex flex-col items-center w-full">
          <h1 className="text-2xl md:text-3xl font-black text-white text-center mb-5 tracking-tight leading-none">
            Our Subscription Plan
          </h1>
          <p className="text-white font-bold text-lg opacity-80 mb-12">Try 1 week free</p>

          {/* Combined Plans Container */}
          <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 relative">
            {/* Free Plan */}
            <motion.button 
              onClick={() => setSelectedPlan('free')}
              initial={false}
              animate={{
                backgroundColor: selectedPlan === 'free' ? '#ffffff' : '#1f2937',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-3xl z-0 transition-all active:translate-y-0.5 active:shadow-none",
                selectedPlan === 'free' 
                  ? "shadow-[0_4px_0_0_#2d3748] border-white" 
                  : "border-duo-border shadow-[0_4px_0_0_#37464f] hover:bg-white/5"
              )}
            >
              <div className="text-center w-full bg-[#2d3748] flex flex-col items-center justify-center py-10">
                <h3 className="font-black uppercase tracking-widest text-white text-sm">Free</h3>
                <p className="text-white/70 font-black uppercase tracking-tighter mt-1 text-lg">$0 / mo</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full py-9">
                <FeatureList features={freeFeatures} isSelected={selectedPlan === 'free'} />
              </div>
            </motion.button>

            {/* Pro Plan */}
            <motion.button 
              onClick={() => {
                if (!profile?.is_subscribed || profile.subscription_tier !== 'pro') {
                  setSelectedPlan('pro')
                }
              }}
              initial={false}
              animate={{
                backgroundColor: selectedPlan === 'pro' ? '#ffffff' : '#1f2937',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-3xl z-10 transition-all active:translate-y-0.5 active:shadow-none",
                selectedPlan === 'pro'
                  ? "shadow-brutal-green border-white"
                  : "border-duo-border shadow-[0_4px_0_0_#37464f] hover:bg-white/5",
                profile?.is_subscribed && profile.subscription_tier === 'pro' && "cursor-default"
              )}
            >
              <div className="text-center w-full bg-duo-green flex flex-col items-center justify-center py-10">
                <h3 className="font-black uppercase tracking-widest text-white text-sm">
                  {profile?.is_subscribed && profile.subscription_tier === 'pro' ? 'Your Plan' : 'Pro'}
                </h3>
                <p className="text-white/90 font-black uppercase tracking-tighter mt-1 text-lg">$2.99 / mo</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full bg-white/0 py-9">
                <FeatureList features={proFeatures} isSelected={selectedPlan === 'pro'} />
              </div>
            </motion.button>

            {/* Pro Family Plan */}
            <motion.button 
              onClick={() => {
                if (!profile?.is_subscribed || profile.subscription_tier !== 'family') {
                  setSelectedPlan('family')
                }
              }}
              initial={false}
              animate={{
                backgroundColor: selectedPlan === 'family' ? '#ffffff' : '#1f2937',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-3xl z-0 transition-all active:translate-y-0.5 active:shadow-none",
                selectedPlan === 'family'
                  ? "shadow-brutal-blue border-white" 
                  : "border-duo-border shadow-[0_4px_0_0_#37464f] hover:bg-white/5",
                profile?.is_subscribed && profile.subscription_tier === 'family' && "cursor-default"
              )}
            >
              <div className="text-center w-full bg-[#1cb0f6] flex flex-col items-center justify-center py-10">
                <h3 className="font-black uppercase tracking-widest text-white text-sm">
                  {profile?.is_subscribed && profile.subscription_tier === 'family' ? 'Your Plan' : 'Pro Family'}
                </h3>
                <p className="text-white/80 font-black uppercase tracking-tighter mt-1 text-lg">$4.99 / mo</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full py-9">
                <FeatureList features={familyFeatures} isSelected={selectedPlan === 'family'} />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full flex justify-center mt-14 mb-8">
          <button 
            onClick={handleSubscriptionCheckout}
            disabled={selectedPlan === 'free' || isProcessingSubscription || (profile?.is_subscribed && profile.subscription_tier === selectedPlan)}
            className={cn(
                "text-white font-black text-sm uppercase tracking-widest px-20 py-5 rounded-2xl transition-all min-w-85 flex items-center justify-center gap-3",
                selectedPlan === 'free' || (profile?.is_subscribed && profile.subscription_tier === selectedPlan)
                  ? "bg-duo-gray/20 cursor-not-allowed opacity-50 shadow-[0_4px_0_0_#37464f]"
                  : "bg-duo-green shadow-brutal-green hover:bg-[#61e002] active:translate-y-0.5 active:shadow-none"
            )}
          >
            {isProcessingSubscription ? (
              <Loader className="w-5 h-5 text-white" />
            ) : (
              profile?.is_subscribed && profile.subscription_tier === selectedPlan 
                ? (profile.subscription_status === 'trialing' 
                    ? `${getDaysRemaining(profile.subscription_end_at)} DAYS LEFT` 
                    : 'CURRENT PLAN') 
                : selectedPlan === 'free' 
                  ? 'FREE PLAN' 
                  : 'START MY 1 WEEK FREE'
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="w-full text-center mb-8">
          <p className="text-duo-gray text-sm font-bold leading-relaxed opacity-60">
            After your free trial, you will be charged for the Pro subscription. 
            You can cancel at any time in your account settings. 
            Terms and conditions apply.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-duo-border mb-10"></div>

        {/* Hearts Section */}
        {heartItems.length > 0 && (
          <section className="mb-10">
            <h3 className="font-black text-white uppercase tracking-wider mb-4 opacity-60">Hearts</h3>
            <div className="space-y-3">
              {heartItems.map(item => (
                <StoreItem 
                  key={item.id}
                  icon={item.icon_url || hearts} 
                  title={item.title} 
                  description={item.description} 
                  cost={item.cost.toString()} 
                  costIcon={diamond}
                >
                  <button
                        onClick={() => {
                          const isRefill = item.title.toLowerCase().includes('refill');
                          const heartsToAdd = isRefill ? 5 : 1;
                          purchaseHeartRefill(item, heartsToAdd, isRefill);
                        }}
                        disabled={profile?.is_subscribed || isPurchasing !== null || (profile?.diamonds || 0) < item.cost || ((profile?.hearts || 0) >= 5 && item.title.toLowerCase().includes('refill'))}
                        className="flex items-center justify-center w-20 md:w-24 gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-transparent border-2 border-duo-border rounded-xl hover:bg-white/5 transition-all shadow-[0_2px_0_0_#37464f] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPurchasing === item.id ? (
                          <Loader className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        ) : profile?.is_subscribed ? (
                          <InfinityIcon className="w-5 h-5 text-duo-blue" />
                        ) : (
                          <span className="font-black text-duo-blue uppercase tracking-widest text-[10px] md:text-sm">BUY</span>
                        )}
                      </button>
                </StoreItem>
              ))}
            </div>
          </section>
        )}

        {/* Power-ups Section */}
        {powerUpItems.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-white uppercase tracking-wider opacity-60">Streak Freezer</h3>
              <span className="text-white/70 text-sm">You have: {profile?.streak_freezer_uses || 0}</span>
            </div>
            <div className="space-y-3">
              {powerUpItems.map(item => (
                    <StoreItem 
                      key={item.id}
                      icon={item.icon_url || ice} 
                      title={item.title} 
                      description={item.description} 
                      cost={item.cost.toString()} 
                      costIcon={diamond}
                    >
                      <button
                        onClick={() => purchaseStreakFreezer(item)}
                        disabled={isPurchasing !== null || (profile?.diamonds || 0) < item.cost}
                        className="flex items-center justify-center w-20 md:w-24 gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-transparent border-2 border-duo-border rounded-xl hover:bg-white/5 transition-all shadow-[0_2px_0_0_#37464f] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPurchasing === item.id ? (
                          <Loader className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        ) : (
                          <span className="font-black text-duo-blue uppercase tracking-widest text-[10px] md:text-sm">BUY</span>
                        )}
                      </button>
                    </StoreItem>
                  ))}
            </div>
          </section>
        )}

        {/* Fallback if no store items */}
        {heartItems.length === 0 && powerUpItems.length === 0 && (
          <div className="text-center text-duo-gray font-bold py-12">No store items available yet</div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-duo-dark border-2 border-duo-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-[0_8px_0_0_#37464f] animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-6">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-duo-green/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-duo-green" strokeWidth={4} />
              </div>
              
              {/* Success Title */}
              <h2 className="font-black text-white text-2xl uppercase tracking-wider">{successDetails.title}</h2>
              
              {/* Success Message */}
              <p className="text-duo-gray font-bold text-lg">{successDetails.message}</p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-duo-green border-2 border-duo-green rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-brutal-green active:translate-y-1 active:shadow-none transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}