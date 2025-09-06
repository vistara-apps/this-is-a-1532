import React from 'react'
import { cn } from '../../utils/cn'

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  description,
  required = false,
  ...props
}, ref) => {
  const id = props.id || props.name

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block text-sm font-medium text-dark-200',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}
      
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
          'bg-dark-800 border-dark-600 text-dark-100 placeholder:text-dark-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          
          // Error state
          error && 'border-red-500 focus:ring-red-500',
          
          className
        )}
        ref={ref}
        id={id}
        {...props}
      />
      
      {description && !error && (
        <p className="text-xs text-dark-400">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
