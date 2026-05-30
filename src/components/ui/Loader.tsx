import { cn } from '../../lib/utils'
import type { FC } from 'react'

interface LoaderProps {
  className?: string
}

export const Loader: FC<LoaderProps> = ({ className }) => {
  return (
    <div className={cn("w-8 h-8 border-4 border-duo-green border-t-transparent rounded-full animate-spin", className)} />
  )
}
