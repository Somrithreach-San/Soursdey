import { useState, useEffect, useContext } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import { useStore } from '../contexts'
import { UserContext } from '../contexts/UserContext'
import hearts from '../assets/hearts.png'
import diamond from '../assets/diamond.png'
import ice from '../assets/ice.png'
import xp_booster from '../assets/xp_booster.png'

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
  <div className="flex items-center gap-4 p-4 bg-duo-dark border-2 border-duo-border rounded-2xl hover:bg-white/5 transition-all shadow-[0_4px_0_0_#37464f] active:translate-y-0.5 active:shadow-none">
    <div className="w-16 h-16 flex items-center justify-center">
      <img src={icon} alt={title} className="w-12 h-12 object-contain" />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-duo-gray text-sm font-bold">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-black text-duo-blue uppercase tracking-widest text-sm">{cost}</span>
      {costIcon && <img src={costIcon} alt="cost" className="w-4 h-4 object-contain" />}
    </div>
    {children}
  </div>
)

export const StorePage = () => {
  const { storeItems, fetchStoreItems } = useStore()
  const { profile, removeUserDiamonds, addUserHearts, refreshProfile } = useContext(UserContext)!
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'family'>('pro')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successDetails, setSuccessDetails] = useState({ title: '', message: '', newHearts: 0, newDiamonds: 0 })

  useEffect(() => {
    fetchStoreItems()
  }, [])

  const freeFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: false },
    { label: 'Skills practice', included: false },
    { label: 'Mistakes review', included: false },
    { label: 'Free challenge entry', included: false },
    { label: 'No ads', included: false },
  ]

  const proFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: true },
    { label: 'Skills practice', included: true },
    { label: 'Mistakes review', included: true },
    { label: 'Free challenge entry', included: true },
    { label: 'No ads', included: true },
  ]

  const familyFeatures = [
    { label: 'Learning content', included: true },
    { label: 'Unlimited Hearts', included: true },
    { label: 'Skills practice', included: true },
    { label: 'Free challenge entry', included: true },
    { label: 'No ads', included: true },
    { label: 'Up to 6 accounts', included: true },
  ]

  // Handle purchases
  const purchaseHeartRefill = async (cost: number, heartsToAdd: number) => {
    if (!profile || (profile.diamonds || 0) < cost) {
      alert('Not enough gems!')
      return
    }
    // Can't have more than 5 hearts
    const currentHearts = profile.hearts || 0
    if (currentHearts >= 5) {
      alert('You already have full hearts!')
      return
    }
    try {
      await removeUserDiamonds(cost)
      const heartsToActuallyAdd = Math.min(heartsToAdd, 5 - currentHearts)
      await addUserHearts(heartsToActuallyAdd)
      await refreshProfile()
      const newHeartCount = currentHearts + heartsToActuallyAdd
      const newDiamondCount = (profile?.diamonds || 0) - cost
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
              onClick={() => setSelectedPlan('pro')}
              initial={false}
              animate={{
                backgroundColor: selectedPlan === 'pro' ? '#ffffff' : '#1f2937',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-3xl z-10 transition-all active:translate-y-0.5 active:shadow-none",
                selectedPlan === 'pro'
                  ? "shadow-brutal-green border-white"
                  : "border-duo-border shadow-[0_4px_0_0_#37464f] hover:bg-white/5"
              )}
            >
              <div className="text-center w-full bg-duo-green flex flex-col items-center justify-center py-10">
                <h3 className="font-black uppercase tracking-widest text-white text-sm">Pro</h3>
                <p className="text-white/90 font-black uppercase tracking-tighter mt-1 text-lg">$6.99 / mo</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full bg-white/0 py-9">
                <FeatureList features={proFeatures} isSelected={selectedPlan === 'pro'} />
              </div>
            </motion.button>

            {/* Pro Family Plan */}
            <motion.button 
              onClick={() => setSelectedPlan('family')}
              initial={false}
              animate={{
                backgroundColor: selectedPlan === 'family' ? '#ffffff' : '#1f2937',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={cn(
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-3xl z-0 transition-all active:translate-y-0.5 active:shadow-none",
                selectedPlan === 'family'
                  ? "shadow-brutal-blue border-white" 
                  : "border-duo-border shadow-[0_4px_0_0_#37464f] hover:bg-white/5"
              )}
            >
              <div className="text-center w-full bg-[#1cb0f6] flex flex-col items-center justify-center py-10">
                <h3 className="font-black uppercase tracking-widest text-white text-sm">Pro Family</h3>
                <p className="text-white/80 font-black uppercase tracking-tighter mt-1 text-lg">$9.99 / mo</p>
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
            disabled={selectedPlan === 'free'}
            className={cn(
                "text-white font-black text-sm uppercase tracking-widest px-20 py-5 rounded-2xl transition-all min-w-85",
                selectedPlan === 'free'
                  ? "bg-gray-600 cursor-not-allowed opacity-50 shadow-none"
                  : "bg-duo-green shadow-brutal-green hover:bg-[#61e002] active:translate-y-0.5 active:shadow-none"
            )}
          >
            {selectedPlan === 'free' ? 'CURRENT PLAN' : 'START MY 1 WEEK FREE'}
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
                        onClick={() => purchaseHeartRefill(item.cost, item.title.includes('5') ? 5 : item.title.includes('3') ? 3 : 1)}
                        disabled={(profile?.diamonds || 0) < item.cost || (profile?.hearts || 0) >= 5}
                        className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-duo-border rounded-xl hover:bg-white/5 transition-all shadow-[0_2px_0_0_#37464f] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="font-black text-duo-blue uppercase tracking-widest text-sm">BUY</span>
                      </button>
                </StoreItem>
              ))}
            </div>
          </section>
        )}

        {/* Power-ups Section */}
        {powerUpItems.length > 0 && (
          <section className="mb-10">
            <h3 className="font-black text-white uppercase tracking-wider mb-4 opacity-60">Power-ups</h3>
            <div className="space-y-3">
              {powerUpItems.map(item => (
                    <StoreItem 
                      key={item.id}
                      icon={item.icon_url || (item.title.includes('XP') ? xp_booster : ice)} 
                      title={item.title} 
                      description={item.description} 
                      cost={item.cost.toString()} 
                      costIcon={diamond}
                    >
                      <button
                        onClick={() => {
                          const newDiamondCount = (profile?.diamonds || 0) - item.cost
                          setSuccessDetails({
                            title: 'Purchase Successful!',
                            message: `You unlocked ${item.title}!`,
                            newHearts: profile?.hearts || 0,
                            newDiamonds: newDiamondCount
                          })
                          setShowSuccessModal(true)
                        }}
                        disabled={(profile?.diamonds || 0) < item.cost}
                        className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-duo-border rounded-xl hover:bg-white/5 transition-all shadow-[0_2px_0_0_#37464f] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="font-black text-duo-blue uppercase tracking-widest text-sm">BUY</span>
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
              
              {/* Stats */}
              <div className="flex items-center gap-8 justify-center w-full py-4 border-y-2 border-duo-border">
                <div className="flex items-center gap-2">
                  <img src={hearts} alt="Hearts" className="w-6 h-6 object-contain" />
                  <span className="text-duo-red font-black text-xl">{successDetails.newHearts}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={diamond} alt="Diamonds" className="w-5 h-5 object-contain" />
                  <span className="text-duo-blue font-black text-xl">{successDetails.newDiamonds}</span>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-duo-blue border-2 border-duo-blue rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-[0_4px_0_0_#2563eb] active:translate-y-1 active:shadow-none transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}