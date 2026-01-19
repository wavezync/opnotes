import { useEffect } from 'react'
import { FileStack } from 'lucide-react'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { TemplatesSettings } from '@renderer/components/settings/TemplatesSettings'

export const TemplatesIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([{ label: 'Templates', to: '/templates' }])
  }, [setBreadcrumbs])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
          <FileStack className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Surgery Templates</h1>
          <p className="text-sm text-muted-foreground">
            Pre-defined templates for faster surgery documentation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TemplatesSettings />
      </div>
    </div>
  )
}
