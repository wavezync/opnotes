import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, X, Lightbulb, Tag, Layers, Users, Save } from 'lucide-react'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { TemplateForm, TemplateFormRef } from '@renderer/components/settings/TemplateForm'
import { unwrapResult } from '@renderer/lib/utils'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'

export const AddTemplatePage = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()
  const formRef = useRef<TemplateFormRef>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Templates', to: '/templates' },
      { label: 'Add Template' }
    ])
  }, [setBreadcrumbs])

  const handleSuccess = () => {
    navigate('/templates')
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handleSave = () => {
    formRef.current?.submit()
  }

  // Poll for isSubmitting state
  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current) {
        setIsSubmitting(formRef.current.isSubmitting)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
            <FileText className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Template</h1>
            <p className="text-sm text-muted-foreground">
              Create a new surgery note template
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            isLoading={isSubmitting}
            loadingText="Creating..."
          >
            Create Template
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} title="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex gap-6">
          {/* Main Form */}
          <div
            className="flex-1 min-w-0 animate-fade-in-up"
            style={{ animationDelay: '50ms' }}
          >
            <TemplateForm ref={formRef} onSuccess={handleSuccess} />
          </div>

          {/* Tips Sidebar - Sticky */}
          <div
            className="hidden xl:block w-72 flex-shrink-0 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="sticky top-0">
              <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                    </div>
                    <CardTitle className="text-sm font-medium">Tips</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Use tags like &ldquo;laparoscopic&rdquo; or &ldquo;emergency&rdquo; to organize templates
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Layers className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Categories help group related templates together
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Doctor-specific templates are only visible to the assigned doctor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const EditTemplatePage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useBreadcrumbs()
  const formRef = useRef<TemplateFormRef>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: template, isLoading } = useQuery({
    queryKey: ['surgeryTemplates', 'get', Number(id)],
    queryFn: () => unwrapResult(window.api.invoke('getSurgeryTemplateById', Number(id))),
    enabled: !!id
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Templates', to: '/templates' },
      { label: template?.title || 'Edit Template' }
    ])
  }, [setBreadcrumbs, template])

  const handleSuccess = () => {
    navigate('/templates')
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handleSave = () => {
    formRef.current?.submit()
  }

  // Poll for isSubmitting state
  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current) {
        setIsSubmitting(formRef.current.isSubmitting)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center border border-violet-500/20">
            <FileText className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Template</h1>
            <p className="text-sm text-muted-foreground">
              {template?.title || 'Modify template details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            isLoading={isSubmitting}
            loadingText="Updating..."
          >
            Update Template
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} title="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex gap-6">
          {/* Main Form */}
          <div
            className="flex-1 min-w-0 animate-fade-in-up"
            style={{ animationDelay: '50ms' }}
          >
            <TemplateForm ref={formRef} template={template} onSuccess={handleSuccess} />
          </div>

          {/* Tips Sidebar - Sticky */}
          <div
            className="hidden xl:block w-72 flex-shrink-0 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="sticky top-0">
              <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                    </div>
                    <CardTitle className="text-sm font-medium">Tips</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Use tags like &ldquo;laparoscopic&rdquo; or &ldquo;emergency&rdquo; to organize templates
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Layers className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Categories help group related templates together
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Doctor-specific templates are only visible to the assigned doctor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
