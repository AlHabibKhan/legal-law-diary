import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800':
              variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300':
              variant === 'secondary',
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100':
              variant === 'outline',
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800':
              variant === 'danger',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
