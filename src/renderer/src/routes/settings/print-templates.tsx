import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Star, MoreVertical, Copy, Trash2, ArrowLeft, RotateCcw } from 'lucide-react'
import { queries } from '../../lib/queries'
import { unwrapResult } from '../../lib/utils'
import {
  PrintTemplate,
  DefaultPrintTemplate,
  TemplateType
} from '../../../../shared/types/template-blocks'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'

export const PrintTemplatesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<PrintTemplate | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedDefault, setSelectedDefault] = useState<DefaultPrintTemplate | null>(null)
  const [setAsDefault, setSetAsDefault] = useState(false)

  const { data: templatesData, isLoading } = useQuery(queries.printTemplates.list({}))
  const { data: defaultTemplates } = useQuery(queries.printTemplates.defaults())

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

  const restoreMutation = useMutation({
    mutationFn: ({ key, setAsDefault }: { key: string; setAsDefault: boolean }) =>
      unwrapResult(window.api.invoke('restorePrintTemplateFromDefault', key, { setAsDefault })),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Template restored from default')
      setRestoreDialogOpen(false)
      setSelectedDefault(null)
      setSetAsDefault(false)
      if (result) {
        navigate(`/settings/print-templates/${result.id}`)
      }
    },
    onError: () => {
      toast.error('Failed to restore template')
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

  const handleRestore = (defaultTemplate: DefaultPrintTemplate) => {
    setSelectedDefault(defaultTemplate)
    setSetAsDefault(false)
    setRestoreDialogOpen(true)
  }

  const confirmRestore = () => {
    if (selectedDefault) {
      restoreMutation.mutate({ key: selectedDefault.key, setAsDefault })
    }
  }

  const TemplateCard = ({ template }: { template: PrintTemplate }) => (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {template.isDefault && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Default
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/settings/print-templates/${template.id}`)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {!template.isDefault && (
                  <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(template)}
                  className="text-destructive focus:text-destructive"
                  disabled={template.isDefault}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {template.description && (
          <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => navigate(`/settings/print-templates/${template.id}`)}
        >
          Edit Template
        </Button>
      </CardContent>
    </Card>
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
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Print Templates</h1>
            <p className="text-sm text-muted-foreground">
              Customize how surgery notes appear when printed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {defaultTemplates && defaultTemplates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Default
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {defaultTemplates.map((dt) => (
                  <DropdownMenuItem key={dt.key} onClick={() => handleRestore(dt)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {dt.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {hasTemplates && (
            <Button onClick={() => navigate('/settings/print-templates/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasTemplates ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Surgery Templates */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Surgery Templates
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {surgeryTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>

            {/* Follow-up Templates */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Follow-up Templates
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {followupTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{templateToDelete?.name}&rdquo;? This action cannot
              be undone.
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

      {/* Restore Default Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Default Template</DialogTitle>
            <DialogDescription>
              This will create a new template based on the default &ldquo;{selectedDefault?.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setAsDefault"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked === true)}
              />
              <Label htmlFor="setAsDefault" className="text-sm font-normal">
                Set as default template for {selectedDefault?.type} notes
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore} disabled={restoreMutation.isPending}>
              {restoreMutation.isPending ? 'Restoring...' : 'Restore Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
