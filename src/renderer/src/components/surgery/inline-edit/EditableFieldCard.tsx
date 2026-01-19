import { cn } from '@renderer/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface EditableFieldCardProps {
  /** Card title */
  title: string
  /** Icon component */
  icon: LucideIcon
  /** Icon background color class */
  iconBgColor: string
  /** Icon color class */
  iconColor: string
  /** Card content */
  children: ReactNode
  /** Additional class name for the card */
  className?: string
  /** Animation delay for entrance animation */
  animationDelay?: number
}

export const EditableFieldCard = ({
  title,
  icon: Icon,
  iconBgColor,
  iconColor,
  children,
  className,
  animationDelay = 0
}: EditableFieldCardProps) => {
  return (
    <Card
      className={cn('bg-gradient-to-br from-card to-card/80 animate-fade-in-up', className)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center gap-2.5">
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', iconBgColor)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}
