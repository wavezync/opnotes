import { cn } from '@renderer/lib/utils'
import { LucideIcon } from 'lucide-react'

export type IconBoxColor = 'emerald' | 'violet' | 'primary' | 'amber' | 'rose' | 'blue' | 'pink' | 'cyan' | 'purple' | 'teal' | 'red'
export type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl'

const colorMap: Record<IconBoxColor, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-500',
  violet: 'bg-violet-500/10 text-violet-500',
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-500/10 text-amber-500',
  rose: 'bg-rose-500/10 text-rose-500',
  blue: 'bg-blue-500/10 text-blue-500',
  pink: 'bg-pink-500/10 text-pink-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
  purple: 'bg-purple-500/10 text-purple-500',
  teal: 'bg-teal-500/10 text-teal-500',
  red: 'bg-red-500/10 text-red-500'
}

const sizeMap: Record<IconBoxSize, { container: string; icon: string }> = {
  sm: { container: 'h-6 w-6 rounded-md', icon: 'h-3 w-3' },
  md: { container: 'h-7 w-7 rounded-md', icon: 'h-3.5 w-3.5' },
  lg: { container: 'h-9 w-9 rounded-lg', icon: 'h-4 w-4' },
  xl: { container: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' }
}

export interface IconBoxProps {
  icon: LucideIcon
  color: IconBoxColor
  size?: IconBoxSize
  className?: string
}

export function IconBox({ icon: Icon, color, size = 'md', className }: IconBoxProps) {
  const colorClasses = colorMap[color]
  const sizeClasses = sizeMap[size]

  return (
    <div
      className={cn(
        'flex items-center justify-center flex-shrink-0',
        sizeClasses.container,
        colorClasses,
        className
      )}
    >
      <Icon className={sizeClasses.icon} />
    </div>
  )
}
