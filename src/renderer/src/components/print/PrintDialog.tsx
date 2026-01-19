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
  DialogTitle
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

  // Always fetch templates so we know the count before user clicks
  const { data: templatesData, isLoading } = useQuery({
    ...queries.printTemplates.list({ type: templateType })
  })

  const templates = useMemo(() => templatesData?.data || [], [templatesData?.data])

  // Set default template when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const defaultTemplate = templates.find((t) => t.isDefault) || templates[0]
      setSelectedTemplate(defaultTemplate)
    }
  }, [templates, selectedTemplate])

  const printWithTemplate = async (template: PrintTemplate) => {
    setIsPrinting(true)
    try {
      await window.electronApi.openPrintDialog({
        title,
        templateStructure: template.structure,
        templateContext: context
      })
      onPrint?.()
      setOpen(false)
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePrint = async () => {
    if (!selectedTemplate) return
    await printWithTemplate(selectedTemplate)
  }

  const handleTriggerClick = async () => {
    // If still loading, open dialog to show loading state
    if (isLoading) {
      setOpen(true)
      return
    }

    // If only one template (or none), print directly
    if (templates.length <= 1) {
      const template = templates[0]
      if (template) {
        await printWithTemplate(template)
      }
      return
    }

    // Multiple templates - show dialog
    setOpen(true)
  }

  const defaultTrigger = (
    <Button variant="outline" disabled={isPrinting}>
      <Printer className="h-4 w-4 mr-2" />
      {isPrinting ? 'Printing...' : 'Print'}
    </Button>
  )

  return (
    <>
      <div onClick={handleTriggerClick}>
        {trigger || defaultTrigger}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print {templateType === 'surgery' ? 'Surgery Note' : 'Follow-up Note'}
            </DialogTitle>
            <DialogDescription>
              Select a template for printing this record.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
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
    </>
  )
}
