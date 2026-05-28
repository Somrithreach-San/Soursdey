import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import hearts from '../assets/hearts.png'
import diamond from '../assets/diamond.png'
import ice from '../assets/ice.png'

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
            <Check className={cn("w-4 h-4 flex-shrink-0 mt-0.5", isSelected ? "text-duo-green" : "text-duo-green")} strokeWidth={4} />
          ) : (
            <X className={cn("w-4 h-4 flex-shrink-0 mt-0.5", isSelected ? "text-[#ff4b4b]" : "text-[#ff4b4b]/60")} strokeWidth={4} />
          )}
          <span className={cn(
            "font-bold text-[13px] leading-tight pt-[1px] transition-colors duration-500",
            isSelected ? "text-[#1f2937]" : "text-white"
          )}>
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const StoreItem = ({ icon, title, description, cost, costIcon }: { icon: string, title: string, description: string, cost: string, costIcon?: string }) => (
  <div className="flex items-center gap-4 p-4 bg-duo-dark border-2 border-duo-border rounded-2xl hover:bg-white/5 transition-all cursor-pointer group shadow-[0_4px_0_0_#37464f] active:translate-y-[2px] active:shadow-none">
    <div className="w-16 h-16 flex items-center justify-center">
      <img src={icon} alt={title} className="w-12 h-12 object-contain" />
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-duo-gray text-sm font-bold">{description}</p>
    </div>
    <button className="flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-duo-border rounded-xl group-hover:bg-white/5 transition-all shadow-[0_2px_0_0_#37464f] active:translate-y-[2px] active:shadow-none">
      <span className="font-black text-duo-blue uppercase tracking-widest text-sm">{cost}</span>
      {costIcon && <img src={costIcon} alt="cost" className="w-4 h-4 object-contain" />}
    </button>
  </div>
)

export const StorePage = () => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'family'>('pro')

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
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-[24px] z-0 transition-all active:translate-y-[2px] active:shadow-none",
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
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-[24px] z-10 transition-all active:translate-y-[2px] active:shadow-none",
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
                "w-full md:flex-1 overflow-hidden border-2 flex flex-col relative rounded-[24px] z-0 transition-all active:translate-y-[2px] active:shadow-none",
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
              "text-white font-black text-sm uppercase tracking-widest px-20 py-5 rounded-2xl transition-all min-w-[340px]",
              selectedPlan === 'free'
                ? "bg-gray-600 cursor-not-allowed opacity-50 shadow-none"
                : "bg-duo-green shadow-[0_4px_0_0_#46a302] hover:bg-[#61e002] active:translate-y-[2px] active:shadow-none"
            )}
          >
            {selectedPlan === 'free' ? 'CURRENT PLAN' : 'START MY 1 WEEK FREE'}
          </button>
        </div>

        {/* Footer Info */}
        <div className="w-full text-center">
          <p className="text-duo-gray text-sm font-bold leading-relaxed opacity-60">
            After your free trial, you will be charged for the Pro subscription. 
            You can cancel at any time in your account settings. 
            Terms and conditions apply.
          </p>
        </div>
      </div>

      {/* Store Header (Now Below) */}
      <div className="w-full border-t-2 border-duo-border pt-12">
        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Store</h2>
        
        {/* Hearts Section */}
        <section className="mb-10">
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-4 opacity-60 text-sm">Hearts</h3>
          <div className="space-y-3">
            <StoreItem 
              icon={hearts} 
              title="Refill Hearts" 
              description="Get back to full health!" 
              cost="450" 
              costIcon={diamond}
            />
            <StoreItem 
              icon={hearts} 
              title="Unlimited Hearts" 
              description="Never run out of hearts again with Pro" 
              cost="TRY PRO" 
            />
          </div>
        </section>

        {/* Power-ups Section */}
        <section className="mb-10">
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-4 opacity-60 text-sm">Power-ups</h3>
          <div className="space-y-3">
            <StoreItem 
              icon={ice} 
              title="Streak Freeze" 
              description="Keep your streak alive if you miss a day" 
              cost="200" 
              costIcon={diamond}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
