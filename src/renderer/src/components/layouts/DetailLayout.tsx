import { cn } from '@renderer/lib/utils'

export interface DetailLayoutProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarWidth?: 3 | 4
  className?: string
}

export function DetailLayout({
  header,
  sidebar,
  children,
  sidebarWidth = 3,
  className
}: DetailLayoutProps) {
  const mainWidth = sidebarWidth === 3 ? 'md:col-span-9' : 'md:col-span-8'
  const sidebarColSpan = sidebarWidth === 3 ? 'md:col-span-3' : 'md:col-span-4'

  return (
    <div className={cn('h-full flex flex-col p-6 overflow-hidden', className)}>
      {header}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
          <div className={sidebarColSpan}>{sidebar}</div>
          <div className={mainWidth}>{children}</div>
        </div>
      </div>
    </div>
  )
}
