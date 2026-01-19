import { cn } from '@renderer/lib/utils'

export interface PageLayoutProps {
  children: React.ReactNode
  header: React.ReactNode
  className?: string
}

export function PageLayout({ children, header, className }: PageLayoutProps) {
  return (
    <div className={cn('h-full flex flex-col p-6 overflow-hidden', className)}>
      {header}
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </div>
  )
}
