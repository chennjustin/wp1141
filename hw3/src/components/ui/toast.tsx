import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'success' | 'error'
  duration?: number
  onClose: () => void
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, action, variant = 'default', onClose }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto relative flex w-full max-w-md items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
          variant === 'success' && 'border-green-200 bg-green-50',
          variant === 'error' && 'border-red-200 bg-red-50',
          variant === 'default' && 'border-gray-200 bg-white'
        )}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-semibold text-gray-900">{title}</div>
          )}
          {description && (
            <div className="text-sm text-gray-700">{description}</div>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    )
  }
)

Toast.displayName = 'Toast'

