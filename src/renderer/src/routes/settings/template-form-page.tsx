import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { TemplateForm } from '@renderer/components/settings/TemplateForm'
import { unwrapResult } from '@renderer/lib/utils'
import { Skeleton } from '@renderer/components/ui/skeleton'

export const AddTemplatePage = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Settings', to: '/settings' },
      { label: 'Templates', to: '/settings?tab=templates' },
      { label: 'Add Template' }
    ])
  }, [setBreadcrumbs])

  const handleSuccess = () => {
    navigate('/settings?tab=templates')
  }

  const handleCancel = () => {
    navigate('/settings?tab=templates')
  }

  return (
    <AppLayout title="Add Template">
      <div className="max-w-4xl mx-auto">
        <TemplateForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </AppLayout>
  )
}

export const EditTemplatePage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useBreadcrumbs()

  const { data: template, isLoading } = useQuery({
    queryKey: ['surgeryTemplates', 'get', Number(id)],
    queryFn: () => unwrapResult(window.api.invoke('getSurgeryTemplateById', Number(id))),
    enabled: !!id
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Settings', to: '/settings' },
      { label: 'Templates', to: '/settings?tab=templates' },
      { label: template?.title || 'Edit Template' }
    ])
  }, [setBreadcrumbs, template])

  const handleSuccess = () => {
    navigate('/settings?tab=templates')
  }

  const handleCancel = () => {
    navigate('/settings?tab=templates')
  }

  if (isLoading) {
    return (
      <AppLayout title="Edit Template">
        <div className="max-w-4xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Edit Template">
      <div className="max-w-4xl mx-auto">
        <TemplateForm template={template} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </AppLayout>
  )
}
