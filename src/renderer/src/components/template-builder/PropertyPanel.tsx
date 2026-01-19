import {
  TemplateBlock,
  FieldDefinition,
  ConditionalBlock,
  TwoColumnBlock
} from '../../../../shared/types/template-blocks'
import { FIELDS_BY_CATEGORY, CATEGORY_LABELS } from '../../../../shared/constants/template-fields'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible'
import { ChevronDown, Copy, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Import property editors
import { HeaderProperties } from './properties/HeaderProperties'
import { TextProperties } from './properties/TextProperties'
import { DataFieldProperties } from './properties/DataFieldProperties'
import { DataTableProperties } from './properties/DataTableProperties'
import { RichContentProperties } from './properties/RichContentProperties'
import { DividerProperties } from './properties/DividerProperties'
import { SpacerProperties } from './properties/SpacerProperties'
import { DoctorsListProperties } from './properties/DoctorsListProperties'
import { ConditionalProperties } from './properties/ConditionalProperties'
import { TwoColumnProperties } from './properties/TwoColumnProperties'
import { ImageProperties } from './properties/ImageProperties'

// Nested editing state
interface NestedEditState {
  childBlock: TemplateBlock
  parentBlock: ConditionalBlock | TwoColumnBlock
  parentType: 'conditional' | 'two-column'
  updateChild: (updated: TemplateBlock) => void
}

interface FieldPillProps {
  field: FieldDefinition
}

const FieldPill = ({ field }: FieldPillProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(field.path)
    toast.success(`${field.path} copied to clipboard`)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-xs',
        'bg-muted hover:bg-muted/80',
        'text-muted-foreground hover:text-foreground',
        'transition-colors'
      )}
      title={`${field.description}\nExample: ${field.example}`}
    >
      <span className="truncate">{field.label}</span>
      <Copy className="h-2.5 w-2.5 opacity-50" />
    </button>
  )
}

interface FieldsSectionProps {
  category: string
  fields: FieldDefinition[]
}

const FieldsSection = ({ category, fields }: FieldsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <span>{CATEGORY_LABELS[category] || category}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', isOpen ? 'rotate-180' : '')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        <div className="flex flex-wrap gap-1">
          {fields.map((field) => (
            <FieldPill key={field.path} field={field} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface PropertyPanelProps {
  selectedBlock: TemplateBlock | null
  onUpdateBlock: (block: TemplateBlock) => void
}

export const PropertyPanel = ({ selectedBlock, onUpdateBlock }: PropertyPanelProps) => {
  const [nestedEdit, setNestedEdit] = useState<NestedEditState | null>(null)

  // Clear nested edit when parent selection changes
  useEffect(() => {
    setNestedEdit(null)
  }, [selectedBlock?.id])

  // Handle editing a child block from within a container (conditional or two-column)
  const handleEditChild = useCallback(
    (childBlock: TemplateBlock, updateChild: (updated: TemplateBlock) => void) => {
      if (selectedBlock?.type === 'conditional') {
        setNestedEdit({
          childBlock,
          parentBlock: selectedBlock as ConditionalBlock,
          parentType: 'conditional',
          updateChild
        })
      } else if (selectedBlock?.type === 'two-column') {
        setNestedEdit({
          childBlock,
          parentBlock: selectedBlock as TwoColumnBlock,
          parentType: 'two-column',
          updateChild
        })
      }
    },
    [selectedBlock]
  )

  // Handle updating the nested child
  const handleUpdateNestedChild = useCallback(
    (updated: TemplateBlock) => {
      if (nestedEdit) {
        nestedEdit.updateChild(updated)
        setNestedEdit((prev) =>
          prev ? { ...prev, childBlock: updated } : null
        )
      }
    },
    [nestedEdit]
  )

  // Clear nested edit when parent selection changes
  const handleBackToParent = () => {
    setNestedEdit(null)
  }

  // Get the block to display properties for
  const displayBlock = nestedEdit ? nestedEdit.childBlock : selectedBlock
  const displayOnUpdate = nestedEdit ? handleUpdateNestedChild : onUpdateBlock

  const renderPropertyEditor = (block: TemplateBlock, onUpdate: (b: TemplateBlock) => void) => {
    switch (block.type) {
      case 'header':
        return <HeaderProperties block={block} onUpdate={onUpdate} />
      case 'text':
        return <TextProperties block={block} onUpdate={onUpdate} />
      case 'data-field':
        return <DataFieldProperties block={block} onUpdate={onUpdate} />
      case 'data-table':
        return <DataTableProperties block={block} onUpdate={onUpdate} />
      case 'rich-content':
        return <RichContentProperties block={block} onUpdate={onUpdate} />
      case 'divider':
        return <DividerProperties block={block} onUpdate={onUpdate} />
      case 'spacer':
        return <SpacerProperties block={block} onUpdate={onUpdate} />
      case 'doctors-list':
        return <DoctorsListProperties block={block} onUpdate={onUpdate} />
      case 'conditional':
        return (
          <ConditionalProperties
            block={block}
            onUpdate={onUpdate}
            onEditChild={handleEditChild}
          />
        )
      case 'two-column':
        return (
          <TwoColumnProperties
            block={block}
            onUpdate={onUpdate}
            onEditChild={handleEditChild}
          />
        )
      case 'image':
        return <ImageProperties block={block} onUpdate={onUpdate} />
      default:
        return (
          <div className="p-4 text-sm text-muted-foreground">
            No properties available for this block type.
          </div>
        )
    }
  }

  return (
    <div className="w-72 flex-shrink-0 border-l bg-background flex flex-col">
      <div className="p-3 border-b">
        {nestedEdit ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 -ml-2 mb-1 text-xs"
              onClick={handleBackToParent}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to {nestedEdit.parentType === 'two-column' ? 'Two Column' : 'Conditional'}
            </Button>
            <h3 className="font-semibold text-sm">Nested Block Properties</h3>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {nestedEdit.childBlock.type.replace('-', ' ')} Block
            </p>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-sm">Properties</h3>
            {selectedBlock && (
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                {selectedBlock.type.replace('-', ' ')} Block
              </p>
            )}
          </>
        )}
      </div>

      <ScrollArea className="flex-1">
        {displayBlock ? (
          <div className="p-3">{renderPropertyEditor(displayBlock, displayOnUpdate)}</div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground text-center">
            <p>Select a block to edit its properties</p>
          </div>
        )}

        <Separator className="my-2" />

        {/* Available Fields Reference */}
        <div className="p-2">
          <h4 className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Available Fields
          </h4>
          <div className="space-y-1">
            {Object.entries(FIELDS_BY_CATEGORY).map(([category, fields]) => (
              <FieldsSection key={category} category={category} fields={fields} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
