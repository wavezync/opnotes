import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Printer, FileText, ChevronDown, Check } from 'lucide-react'
import { queries } from '@renderer/lib/queries'
import { TemplateType, PrintTemplate, TemplateContext } from '../../../../shared/types/template-blocks'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'

interface PrintDialogProps {
  trigger?: React.ReactNode
  templateType: TemplateType
  title: string
  context: TemplateContext
  onPrint?: () => void
}

export const PrintDialog = ({
  trigger,
  templateType,
  title,
  context,
  onPrint
}: PrintDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // Fetch all templates of this type
  const { data: templatesData } = useQuery({
    ...queries.printTemplates.list({ type: templateType }),
    enabled: open
  })

  const templates = useMemo(() => templatesData?.data || [], [templatesData?.data])
  const hasMultipleTemplates = templates.length > 1

  // Set default template when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const defaultTemplate = templates.find((t) => t.isDefault) || templates[0]
      setSelectedTemplate(defaultTemplate)
    }
  }, [templates, selectedTemplate])

  const handlePrint = async () => {
    if (!selectedTemplate) return

    setIsPrinting(true)
    try {
      await window.electronApi.openPrintDialog({
        title,
        templateStructure: selectedTemplate.structure,
        templateContext: context
      })
      onPrint?.()
      setOpen(false)
    } finally {
      setIsPrinting(false)
    }
  }

  // If there's only one template (or none), print directly without dialog
  const handleTriggerClick = async () => {
    // Query templates first if not loaded
    if (!templatesData) {
      setOpen(true)
      return
    }

    if (templates.length <= 1) {
      // Direct print without dialog
      const template = templates[0]
      if (template) {
        setIsPrinting(true)
        try {
          await window.electronApi.openPrintDialog({
            title,
            templateStructure: template.structure,
            templateContext: context
          })
          onPrint?.()
        } finally {
          setIsPrinting(false)
        }
      }
    } else {
      setOpen(true)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" disabled={isPrinting}>
      <Printer className="h-4 w-4 mr-2" />
      {isPrinting ? 'Printing...' : 'Print'}
    </Button>
  )

  // If we haven't loaded templates yet, show dialog to load them
  // Otherwise, only show dialog if multiple templates exist
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => {
        e.preventDefault()
        handleTriggerClick()
      }}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print {templateType === 'surgery' ? 'Surgery Note' : 'Follow-up Note'}
          </DialogTitle>
          <DialogDescription>
            {hasMultipleTemplates
              ? 'Select a template for printing this record.'
              : 'Click Print to generate the document.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {hasMultipleTemplates && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Template
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {selectedTemplate?.name || 'Select template'}
                      </span>
                      {selectedTemplate?.isDefault && (
                        <span className="text-xs text-muted-foreground">(Default)</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="truncate">{template.name}</span>
                        {template.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {template.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {template.isDefault && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {!hasMultipleTemplates && templates.length === 1 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{templates[0].name}</p>
                {templates[0].description && (
                  <p className="text-xs text-muted-foreground">{templates[0].description}</p>
                )}
              </div>
            </div>
          )}

          {templates.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates available for this type.</p>
              <p className="text-xs">Create a template in Settings → Print Templates.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedTemplate || isPrinting}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
