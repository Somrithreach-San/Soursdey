import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={cn(
      "flex-1 min-h-screen p-4 md:p-8 transition-colors duration-300",
      theme === 'light' ? "bg-[#FFFFFF]" : "bg-duo-dark"
    )}>
      <div className="max-w-2xl mx-auto">
        <h1 className={cn(
          "text-2xl md:text-3xl font-black mb-8 uppercase tracking-tight",
          theme === 'light' ? "text-[#4B4B4B]" : "text-white"
        )}>
          Settings
        </h1>

        <div className="space-y-12">
          {/* Appearance Section */}
          <section className="flex flex-col gap-6">
            <div className={cn(
              "border-b-2 pb-2",
              theme === 'light' ? "border-[#E5E5E5]" : "border-duo-border"
            )}>
              <h2 className="text-lg font-black text-duo-gray uppercase tracking-wider">
                Appearance
              </h2>
            </div>
            
            <div className="flex items-center justify-between">
              <label className={cn(
                "font-black text-base transition-colors",
                theme === 'light' ? "text-[#4B4B4B]" : "text-white"
              )}>
                Dark mode
              </label>
              
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex h-5 w-11 items-center rounded-full transition-all duration-300",
                  theme === 'dark' ? "bg-duo-green" : "bg-[#E5E5E5]"
                )}
              >
                <div
                  className={cn(
                    "absolute h-[30px] w-[30px] rounded-md bg-white transition-all duration-300 flex items-center justify-center -top-[7px] border-2",
                    theme === 'dark' 
                      ? "translate-x-5 border-[#46a302] shadow-[0_3px_0_0_#46a302]" 
                      : "translate-x-[-4px] border-[#B7B7B7] shadow-[0_3px_0_0_#B7B7B7]"
                  )}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

