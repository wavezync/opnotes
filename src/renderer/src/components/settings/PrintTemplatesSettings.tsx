import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  FileText,
  Star,
  MoreVertical,
  Copy,
  Trash2,
  RotateCcw,
  Printer,
  ChevronRight,
  Pencil
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { queries } from '../../lib/queries'
import { unwrapResult } from '../../lib/utils'
import { PrintTemplate, TemplateType } from '../../../../shared/types/template-blocks'
import { Button } from '../../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../../components/ui/alert-dialog'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'

export const PrintTemplatesSettings = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<PrintTemplate | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const { data: templatesData, isLoading } = useQuery(queries.printTemplates.list({}))

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(window.api.invoke('deletePrintTemplateById', id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Template deleted')
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    },
    onError: () => {
      toast.error('Failed to delete template')
    }
  })

  const duplicateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      unwrapResult(window.api.invoke('duplicatePrintTemplate', id, name)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Template duplicated')
      if (result) {
        navigate(`/settings/print-templates/${result.id}`)
      }
    },
    onError: () => {
      toast.error('Failed to duplicate template')
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: TemplateType }) =>
      unwrapResult(window.api.invoke('setDefaultPrintTemplate', id, type)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Default template updated')
    },
    onError: () => {
      toast.error('Failed to set default template')
    }
  })

  const resetMutation = useMutation({
    mutationFn: () => unwrapResult(window.api.invoke('resetPrintTemplatesToDefaults')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Templates reset to defaults')
      setResetDialogOpen(false)
    },
    onError: () => {
      toast.error('Failed to reset templates')
    }
  })

  const surgeryTemplates = templatesData?.data.filter((t) => t.type === 'surgery') || []
  const followupTemplates = templatesData?.data.filter((t) => t.type === 'followup') || []

  const handleDelete = (template: PrintTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDuplicate = (template: PrintTemplate) => {
    duplicateMutation.mutate({
      id: template.id,
      name: `${template.name} (Copy)`
    })
  }

  const handleSetDefault = (template: PrintTemplate) => {
    setDefaultMutation.mutate({ id: template.id, type: template.type })
  }

  const handleReset = () => {
    setResetDialogOpen(true)
  }

  const confirmReset = () => {
    resetMutation.mutate()
  }

  const TemplateCard = ({ template }: { template: PrintTemplate }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/settings/print-templates/${template.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/settings/print-templates/${template.id}`)
        }
      }}
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-xl border bg-card',
        'cursor-pointer transition-all duration-200',
        'hover:border-primary/30 hover:shadow-sm hover:bg-accent/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center',
          'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
          'border border-orange-500/20',
          'group-hover:from-orange-500/20 group-hover:to-amber-500/20 transition-colors'
        )}
      >
        <FileText className="h-5 w-5 text-orange-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium truncate">{template.name}</h3>
          {template.isDefault && (
            <Badge
              variant="secondary"
              className="gap-1 px-1.5 py-0 text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20"
            >
              <Star className="h-2.5 w-2.5 fill-current" />
              Default
            </Badge>
          )}
        </div>
        {template.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-background'
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/settings/print-templates/${template.id}`)
              }}
              className="gap-2"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDuplicate(template)
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
              Duplicate
            </DropdownMenuItem>
            {!template.isDefault && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleSetDefault(template)
                }}
                className="gap-2"
              >
                <Star className="h-4 w-4 text-muted-foreground" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(template)
              }}
              className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              disabled={template.isDefault}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Arrow indicator */}
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted-foreground/50',
            'transition-all duration-200',
            'group-hover:text-primary group-hover:translate-x-0.5'
          )}
        />
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-medium mb-1">No print templates yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Create your first template to customize how surgery notes appear when printed.
      </p>
      <Button onClick={() => navigate('/settings/print-templates/new')}>
        <Plus className="h-4 w-4 mr-2" />
        Create Template
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    )
  }

  const hasTemplates = surgeryTemplates.length > 0 || followupTemplates.length > 0

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Printer className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-base">Print Templates</CardTitle>
                <CardDescription>Customize how surgery notes appear when printed</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              {hasTemplates && (
                <Button size="sm" onClick={() => navigate('/settings/print-templates/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {!hasTemplates ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Surgery Templates */}
          {surgeryTemplates.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Surgery Templates
              </h2>
              <div className="space-y-2">
                {surgeryTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Templates */}
          {followupTemplates.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Follow-up Templates
              </h2>
              <div className="space-y-2">
                {followupTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{templateToDelete?.name}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => templateToDelete && deleteMutation.mutate(templateToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset to Defaults Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Templates</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all your custom templates and restore the original default templates.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? 'Resetting...' : 'Reset Templates'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
