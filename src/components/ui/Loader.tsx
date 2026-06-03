import { cn } from '../../lib/utils'
import type { FC } from 'react'

interface LoaderProps {
  className?: string
}

export const Loader: FC<LoaderProps> = ({ className }) => {
  return (
    <div className={cn("w-12 h-12 text-duo-green", className)}>
      <style>{`
        @keyframes loading-ui-swirling-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loading-ui-swirling-dash {
          0% {
            stroke-dasharray: 1, 800;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 400, 400;
            stroke-dashoffset: -200px;
          }
          100% {
            stroke-dasharray: 800, 1;
            stroke-dashoffset: -800px;
          }
        }

        .loading-ui-swirling-circle {
          transform-origin: center;
          animation:
            loading-ui-swirling-dash var(--duration, 1.5s) ease-in-out infinite alternate,
            loading-ui-swirling-spin calc(var(--duration, 1.5s) * 1.333333) linear infinite;
        }
      `}</style>
      <svg 
        viewBox="0 0 800 800" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <circle
          className="loading-ui-swirling-circle"
          cx="400"
          cy="400"
          r="200"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="60"
        />
      </svg>
    </div>
  )
}
