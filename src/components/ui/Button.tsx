import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'super'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
    const variants = {
      primary: 'bg-duo-green text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#61e002] active:shadow-none active:translate-y-[4px]',
      secondary: 'bg-duo-orange text-white shadow-[0_4px_0_0_#e68700] hover:bg-[#ffaa2e] active:shadow-none active:translate-y-[4px]',
      ghost: 'bg-transparent border-2 border-duo-border text-duo-gray hover:bg-white/5 active:bg-white/10',
      danger: 'bg-duo-red text-white shadow-[0_4px_0_0_#d33131] hover:bg-[#ff5252] active:shadow-none active:translate-y-[4px]',
      super: 'bg-[#3c4dff] text-white shadow-[0_4px_0_0_#2e3bcc] hover:bg-[#4d5cff] active:shadow-none active:translate-y-[4px]',
    }

    const sizes = {
      sm: 'py-2.5 px-4 text-sm',
      md: 'py-3.5 px-5 text-base',
      lg: 'py-5 px-8 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'brutal-button font-bold uppercase tracking-wider rounded-xl transition-all',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
