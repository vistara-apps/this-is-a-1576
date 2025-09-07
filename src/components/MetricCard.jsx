import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../utils/cn'

const MetricCard = ({ title, value, icon, variant = 'default', change }) => {
  const variants = {
    default: 'bg-surface border-gray-200',
    trendingUp: 'bg-surface border-accent',
    trendingDown: 'bg-surface border-red-300'
  }

  return (
    <div className={cn(
      'p-6 rounded-lg shadow-card border-2 transition-all duration-200 hover:shadow-lg',
      variants[variant]
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {change && (
            <div className={cn(
              'flex items-center mt-2 text-sm',
              variant === 'trendingUp' ? 'text-accent' : 
              variant === 'trendingDown' ? 'text-red-500' : 'text-text-secondary'
            )}>
              {variant === 'trendingUp' && <TrendingUp className="w-4 h-4 mr-1" />}
              {variant === 'trendingDown' && <TrendingDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'trendingUp' ? 'bg-accent/10 text-accent' : 
          variant === 'trendingDown' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-text-secondary'
        )}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default MetricCard