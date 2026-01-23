import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        'animate-in fade-in duration-500',
        className
      )}
    >
      <div className="p-4 rounded-full mb-4 bg-accent shadow-sm">
        <Icon size={48} className="text-muted-foreground/50" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground max-w-[300px] mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          className="shadow-sm active:scale-95 transition-all"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
