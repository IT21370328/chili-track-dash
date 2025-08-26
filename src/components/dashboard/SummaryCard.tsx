import { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export function SummaryCard({ title, value, icon: Icon, trend, description }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              trend.isPositive 
                ? 'bg-success text-success-foreground' 
                : 'bg-destructive text-destructive-foreground'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  )
}