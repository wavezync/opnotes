import { cn } from '@renderer/lib/utils'

export interface FormLayoutProps {
  header: React.ReactNode
  form: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function FormLayout({ header, form, sidebar, className }: FormLayoutProps) {
  // If no sidebar, render full-width form
  if (!sidebar) {
    return (
      <div className={cn('h-full flex flex-col p-6 overflow-hidden', className)}>
        {header}
        <div className="flex-1 overflow-y-auto min-h-0">{form}</div>
      </div>
    )
  }

  // With sidebar, use 2-col + 1-col grid
  return (
    <div className={cn('h-full flex flex-col p-6 overflow-hidden', className)}>
      {header}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{form}</div>
          <div className="lg:col-span-1 space-y-4">{sidebar}</div>
        </div>
      </div>
    </div>
  )
}
