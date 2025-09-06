import React from 'react'
import { cn } from '../../utils/cn'

const buttonVariants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-dark-700 text-dark-100 hover:bg-dark-600 focus:ring-dark-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline: 'border border-dark-600 text-dark-300 hover:bg-dark-800 hover:text-white focus:ring-primary-500',
  ghost: 'text-dark-300 hover:bg-dark-800 hover:text-white focus:ring-primary-500',
  link: 'text-primary-500 underline-offset-4 hover:underline focus:ring-primary-500',
}

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  default: 'h-10 px-4 py-2',
  lg: 'h-12 px-8 text-lg',
  icon: 'h-10 w-10',
}

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  ...props
}, ref) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-95',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        // Loading state
        loading && 'opacity-70 cursor-wait',
        
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
