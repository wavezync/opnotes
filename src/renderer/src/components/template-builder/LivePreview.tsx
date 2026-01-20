import { useMemo } from 'react'
import { ChevronDown, Database } from 'lucide-react'
import { TemplateStructure } from '../../../../shared/types/template-blocks'
import { renderTemplate } from '../../lib/template-renderer'
import { useSampleData } from './SampleDataContext'
import { SampleDataEditor } from './SampleDataEditor'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'

interface LivePreviewProps {
  templateStructure: TemplateStructure
}

export const LivePreview = ({ templateStructure }: LivePreviewProps) => {
  const { sampleContext, isEditorOpen, toggleEditor, hasCustomizations } = useSampleData()

  const previewHtml = useMemo(() => {
    try {
      return renderTemplate(templateStructure, sampleContext)
    } catch (error) {
      console.error('Error rendering template:', error)
      return '<div class="p-4 text-red-500">Error rendering template</div>'
    }
  }, [templateStructure, sampleContext])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Preview Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-sm font-medium">Live Preview</span>
        <Badge
          variant="secondary"
          className={cn(
            'text-xs cursor-pointer hover:bg-secondary/80 transition-colors select-none',
            hasCustomizations && 'ring-1 ring-primary/30'
          )}
          onClick={toggleEditor}
        >
          <Database className="h-3 w-3 mr-1" />
          Sample Data
          <ChevronDown
            className={cn('h-3 w-3 ml-1 transition-transform', isEditorOpen && 'rotate-180')}
          />
        </Badge>
      </div>

      {/* Collapsible editor */}
      {isEditorOpen && <SampleDataEditor />}

      {/* Preview Content - scrollable within container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 bg-muted/30">
            <div className="flex justify-center">
              {/* A4 Paper Simulation */}
              <div
                className="bg-white rounded shadow-xl border"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  maxWidth: '100%',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }}
              >
              {/* Print styles scoped to preview */}
              <style>
                {`
                  .preview-content .document {
                    padding: 15mm 20mm;
                    font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
                    font-size: 11pt;
                    line-height: 1.5;
                    color: #000;
                  }
                  .preview-content h1 {
                    margin: 0;
                  }
                  .preview-content h2 {
                    margin: 0;
                  }
                  .preview-content .header-section {
                    margin-bottom: 12pt;
                  }
                  .preview-content .text-2xl {
                    font-size: 16pt;
                    font-weight: 700;
                    margin: 0;
                  }
                  .preview-content .text-lg {
                    font-size: 12pt;
                    margin: 0;
                  }
                  .preview-content .text-sm {
                    font-size: 9pt;
                  }
                  .preview-content .text-base {
                    font-size: 11pt;
                  }
                  .preview-content .text-center {
                    text-align: center;
                  }
                  .preview-content .bold {
                    font-weight: 700;
                  }
                  .preview-content .pt-1 {
                    padding-top: 2pt;
                  }
                  .preview-content .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10pt 0;
                    font-size: 10pt;
                  }
                  .preview-content .info-table td {
                    padding: 5pt 8pt;
                    border: 1px solid #999;
                    vertical-align: middle;
                  }
                  .preview-content .info-table .label {
                    font-weight: 600;
                    background: #f5f5f5;
                    white-space: nowrap;
                    width: 1%;
                  }
                  .preview-content .info-table.no-borders td {
                    border: none;
                    padding: 3pt 8pt;
                  }
                  .preview-content .doctors-section {
                    margin: 12pt 0;
                    font-size: 10pt;
                  }
                  .preview-content .doctor-row {
                    margin-bottom: 4pt;
                  }
                  .preview-content .doctor-label {
                    font-weight: 600;
                  }
                  .preview-content .notes-section {
                    margin: 14pt 0;
                  }
                  .preview-content .section-header {
                    font-weight: 600;
                    font-size: 11pt;
                    margin-bottom: 8pt;
                    padding-bottom: 4pt;
                    border-bottom: 1px solid #ccc;
                  }
                  .preview-content .prose {
                    line-height: 1.6;
                    font-size: 10pt;
                  }
                  .preview-content .prose p {
                    margin: 0 0 8pt;
                  }
                  .preview-content .prose ul,
                  .preview-content .prose ol {
                    margin: 8pt 0;
                    padding-left: 20pt;
                  }
                  .preview-content .prose li {
                    margin-bottom: 3pt;
                  }
                  .preview-content .prose strong {
                    font-weight: 600;
                  }
                  .preview-content .data-field {
                    margin: 4pt 0;
                    font-size: 10pt;
                  }
                  .preview-content .data-field .label {
                    font-weight: 600;
                  }
                  .preview-content hr {
                    margin: 10pt 0;
                    border: none;
                    border-top: 1px solid #333;
                  }
                  .preview-content .two-column {
                    display: flex;
                    gap: 12pt;
                  }
                  .preview-content .image-block img {
                    max-width: 100%;
                    height: auto;
                  }
                `}
              </style>
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
