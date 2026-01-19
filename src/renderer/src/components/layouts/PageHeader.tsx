import { Button } from '@renderer/components/ui/button'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IconBox, IconBoxColor } from './IconBox'

export interface PageHeaderProps {
  icon: LucideIcon
  iconColor: IconBoxColor
  title: string
  subtitle?: React.ReactNode
  showBackButton?: boolean
  actions?: React.ReactNode
  animate?: boolean
}

export function PageHeader({
  icon,
  iconColor,
  title,
  subtitle,
  showBackButton = false,
  actions,
  animate = true
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className={`flex items-center justify-between mb-6 ${animate ? 'animate-fade-in-up' : ''}`}>
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <IconBox icon={icon} color={iconColor} size="xl" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
