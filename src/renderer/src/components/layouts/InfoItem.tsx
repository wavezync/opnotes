import { cn } from '@renderer/lib/utils'
import { LucideIcon } from 'lucide-react'
import { IconBox, IconBoxColor, IconBoxSize } from './IconBox'

export interface InfoItemProps {
  icon: LucideIcon
  iconColor: IconBoxColor
  label: string
  value: React.ReactNode
  mono?: boolean
  iconSize?: IconBoxSize
  className?: string
}

export function InfoItem({
  icon,
  iconColor,
  label,
  value,
  mono = false,
  iconSize = 'lg',
  className
}: InfoItemProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <IconBox icon={icon} color={iconColor} size={iconSize} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={cn('text-sm font-medium truncate', mono && 'font-mono')}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  )
}
