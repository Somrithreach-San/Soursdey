import { useState, type FC, type ImgHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Loader } from './Loader'

interface ImageWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
  loaderClassName?: string
  imgClassName?: string
}

export const ImageWithLoader: FC<ImageWithLoaderProps> = ({ 
  className, 
  loaderClassName,
  imgClassName,
  src, 
  alt, 
  onLoad,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className={cn("w-6 h-6", loaderClassName)} />
        </div>
      )}
      <img
        {...props}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          imgClassName
        )}
        onLoad={(e) => {
          setIsLoading(false)
          onLoad?.(e)
        }}
      />
    </div>
  )
}
