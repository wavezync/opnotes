import { useState } from 'react'
import {
  ConditionalBlock,
  ConditionalOperator,
  TemplateBlock,
  BlockType
} from '../../../../../shared/types/template-blocks'
import { TEMPLATE_FIELDS, BLOCK_DEFINITIONS } from '../../../../../shared/constants/template-fields'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu'
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface ConditionalPropertiesProps {
  block: ConditionalBlock
  onUpdate: (block: ConditionalBlock) => void
  onEditChild?: (childBlock: TemplateBlock, updateChild: (updated: TemplateBlock) => void) => void
}

export const ConditionalProperties = ({
  block,
  onUpdate,
  onEditChild
}: ConditionalPropertiesProps) => {
  const [expandedChildren, setExpandedChildren] = useState<boolean>(true)

  const updateProps = (updates: Partial<ConditionalBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  const addChildBlock = (blockType: BlockType) => {
    const definition = BLOCK_DEFINITIONS.find((b) => b.type === blockType)
    const defaultProps = definition?.defaultProps || {}
    const newBlock: TemplateBlock = {
      id: crypto.randomUUID(),
      type: blockType,
      props: defaultProps as unknown
    } as TemplateBlock

    onUpdate({
      ...block,
      children: [...(block.children || []), newBlock]
    })
  }

  const removeChildBlock = (childId: string) => {
    onUpdate({
      ...block,
      children: (block.children || []).filter((c) => c.id !== childId)
    })
  }

  const handleEditChild = (child: TemplateBlock) => {
    if (onEditChild) {
      onEditChild(child, (updatedChild) => {
        onUpdate({
          ...block,
          children: (block.children || []).map((c) =>
            c.id === updatedChild.id ? updatedChild : c
          )
        })
      })
    }
  }

  const getBlockLabel = (blockType: string) => {
    const def = BLOCK_DEFINITIONS.find((b) => b.type === blockType)
    return def?.label || blockType
  }

  // Filter out blocks that shouldn't be nested (like conditional itself to prevent infinite nesting)
  const allowedChildBlocks = BLOCK_DEFINITIONS.filter(
    (b) => b.type !== 'conditional' && b.type !== 'two-column'
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Field to Check</Label>
        <Select
          value={block.props.field}
          onValueChange={(value) => updateProps({ field: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_FIELDS.map((field) => (
              <SelectItem key={field.path} value={field.path}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Condition</Label>
        <Select
          value={block.props.condition}
          onValueChange={(value: ConditionalOperator) =>
            updateProps({ condition: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="exists">Exists (not null/undefined)</SelectItem>
            <SelectItem value="notEmpty">Not Empty</SelectItem>
            <SelectItem value="isEmpty">Is Empty</SelectItem>
            <SelectItem value="equals">Equals Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {block.props.condition === 'equals' && (
        <div className="space-y-2">
          <Label className="text-sm">Compare Value</Label>
          <Input
            value={block.props.value || ''}
            onChange={(e) => updateProps({ value: e.target.value })}
            placeholder="Value to compare against"
          />
        </div>
      )}

      {/* Nested Blocks Section */}
      <div className="space-y-2">
        <button
          onClick={() => setExpandedChildren(!expandedChildren)}
          className="flex items-center gap-1 text-sm font-medium w-full text-left"
        >
          {expandedChildren ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Nested Content ({block.children?.length || 0})
        </button>

        {expandedChildren && (
          <div className="space-y-2 pl-2 border-l-2 border-muted">
            {(block.children || []).map((child) => (
              <div
                key={child.id}
                className={cn(
                  'flex items-center justify-between gap-2 p-2',
                  'bg-muted/50 rounded-md text-sm',
                  'hover:bg-muted transition-colors cursor-pointer'
                )}
                onClick={() => handleEditChild(child)}
              >
                <span className="truncate">{getBlockLabel(child.type)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeChildBlock(child.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {(block.children || []).length === 0 && (
              <p className="text-xs text-muted-foreground py-2">
                No nested blocks yet
              </p>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {allowedChildBlocks.map((blockDef) => (
                  <DropdownMenuItem
                    key={blockDef.type}
                    onClick={() => addChildBlock(blockDef.type)}
                  >
                    {blockDef.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Content inside this block will only be shown if the condition is met.
        </p>
      </div>
    </div>
  )
}
