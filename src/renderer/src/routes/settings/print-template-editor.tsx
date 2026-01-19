import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { queries } from '../../lib/queries'
import { unwrapResult } from '../../lib/utils'
import {
  TemplateStructure,
  TemplateType,
  NewPrintTemplate,
  PrintTemplateUpdate
} from '../../../../shared/types/template-blocks'
import { DEFAULT_PAGE_SETTINGS } from '../../../../shared/constants/template-fields'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'
import { toast } from 'sonner'
import { TemplateBuilder } from '../../components/template-builder'

const defaultStructure: TemplateStructure = {
  version: 1,
  blocks: []
}

export const PrintTemplateEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [templateType, setTemplateType] = useState<TemplateType>('surgery')
  const [structure, setStructure] = useState<TemplateStructure>(defaultStructure)
  const [isDirty, setIsDirty] = useState(false)

  // Load existing template
  const { data: template, isLoading } = useQuery({
    ...queries.printTemplates.get(parseInt(id || '0', 10)),
    enabled: !isNew && !!id
  })

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
      setTemplateType(template.type)
      setStructure(template.structure)
    }
  }, [template])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: NewPrintTemplate) =>
      unwrapResult(window.api.invoke('createPrintTemplate', data)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      toast.success('Template created')
      setIsDirty(false)
      if (result) {
        navigate(`/settings/print-templates/${result.id}`, { replace: true })
      }
    },
    onError: () => {
      toast.error('Failed to create template')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrintTemplateUpdate }) =>
      unwrapResult(window.api.invoke('updatePrintTemplateById', id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.printTemplates.list({}).queryKey })
      queryClient.invalidateQueries({
        queryKey: queries.printTemplates.get(parseInt(id || '0', 10)).queryKey
      })
      toast.success('Template saved')
      setIsDirty(false)
    },
    onError: () => {
      toast.error('Failed to save template')
    }
  })

  const handleStructureChange = (newStructure: TemplateStructure) => {
    setStructure(newStructure)
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }

    if (isNew) {
      createMutation.mutate({
        name: name.trim(),
        type: templateType,
        description: description.trim() || null,
        structure,
        pageSettings: DEFAULT_PAGE_SETTINGS
      })
    } else {
      updateMutation.mutate({
        id: parseInt(id!, 10),
        data: {
          name: name.trim(),
          description: description.trim() || null,
          structure
        }
      })
    }
  }

  const handleBack = () => {
    if (isDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!confirm) return
    }
    navigate('/settings/print-templates')
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading template...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Template name"
              className="w-64 h-8 text-sm font-medium"
            />
            {isNew && (
              <Select
                value={templateType}
                onValueChange={(value: TemplateType) => {
                  setTemplateType(value)
                  setIsDirty(true)
                }}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          )}
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Template Builder */}
      <div className="flex-1 min-h-0">
        <TemplateBuilder
          templateStructure={structure}
          templateType={templateType}
          onChange={handleStructureChange}
        />
      </div>
    </div>
  )
}
