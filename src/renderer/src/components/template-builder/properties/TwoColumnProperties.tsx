import { useState } from 'react'
import { TwoColumnBlock, TemplateBlock, BlockType } from '../../../../../shared/types/template-blocks'
import { BLOCK_DEFINITIONS } from '../../../../../shared/constants/template-fields'
import { Label } from '../../ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface TwoColumnPropertiesProps {
  block: TwoColumnBlock
  onUpdate: (block: TwoColumnBlock) => void
  onEditChild?: (childBlock: TemplateBlock, updateChild: (updated: TemplateBlock) => void) => void
}

export const TwoColumnProperties = ({ block, onUpdate, onEditChild }: TwoColumnPropertiesProps) => {
  const [activeColumn, setActiveColumn] = useState<'left' | 'right'>('left')

  const updateProps = (updates: Partial<TwoColumnBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  const addBlockToColumn = (column: 'left' | 'right', blockType: BlockType) => {
    const definition = BLOCK_DEFINITIONS.find((b) => b.type === blockType)
    const defaultProps = definition?.defaultProps || {}
    const newBlock: TemplateBlock = {
      id: crypto.randomUUID(),
      type: blockType,
      props: defaultProps as unknown
    } as TemplateBlock

    if (column === 'left') {
      onUpdate({
        ...block,
        left: [...(block.left || []), newBlock]
      })
    } else {
      onUpdate({
        ...block,
        right: [...(block.right || []), newBlock]
      })
    }
  }

  const removeBlockFromColumn = (column: 'left' | 'right', blockId: string) => {
    if (column === 'left') {
      onUpdate({
        ...block,
        left: (block.left || []).filter((b) => b.id !== blockId)
      })
    } else {
      onUpdate({
        ...block,
        right: (block.right || []).filter((b) => b.id !== blockId)
      })
    }
  }

  const handleEditChild = (child: TemplateBlock, column: 'left' | 'right') => {
    if (onEditChild) {
      onEditChild(child, (updatedChild) => {
        if (column === 'left') {
          onUpdate({
            ...block,
            left: (block.left || []).map((b) => (b.id === updatedChild.id ? updatedChild : b))
          })
        } else {
          onUpdate({
            ...block,
            right: (block.right || []).map((b) => (b.id === updatedChild.id ? updatedChild : b))
          })
        }
      })
    }
  }

  const getBlockLabel = (blockType: string) => {
    const def = BLOCK_DEFINITIONS.find((b) => b.type === blockType)
    return def?.label || blockType
  }

  const allowedChildBlocks = BLOCK_DEFINITIONS.filter(
    (b) => b.type !== 'conditional' && b.type !== 'two-column'
  )

  const ratioOptions = [
    { value: '50-50', label: '50% / 50%' },
    { value: '33-67', label: '33% / 67%' },
    { value: '67-33', label: '67% / 33%' },
    { value: '25-75', label: '25% / 75%' },
    { value: '75-25', label: '75% / 25%' }
  ]

  const renderColumnContent = (column: 'left' | 'right') => {
    const blocks = column === 'left' ? block.left || [] : block.right || []

    return (
      <div className="space-y-2">
        {blocks.map((child) => (
          <div
            key={child.id}
            className={cn(
              'flex items-center justify-between gap-2 p-2',
              'bg-muted/50 rounded-md text-sm',
              'hover:bg-muted transition-colors cursor-pointer'
            )}
            onClick={() => handleEditChild(child, column)}
          >
            <span className="truncate">{getBlockLabel(child.type)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                removeBlockFromColumn(column, child.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {blocks.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">
            No blocks in {column} column
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
                onClick={() => addBlockToColumn(column, blockDef.type)}
              >
                {blockDef.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Column Ratio</Label>
        <Select
          value={block.props.ratio}
          onValueChange={(value: TwoColumnBlock['props']['ratio']) =>
            updateProps({ ratio: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratioOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Column Content Tabs */}
      <Tabs value={activeColumn} onValueChange={(v) => setActiveColumn(v as 'left' | 'right')}>
        <TabsList className="w-full">
          <TabsTrigger value="left" className="flex-1 text-xs">
            Left ({block.left?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="right" className="flex-1 text-xs">
            Right ({block.right?.length || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="left" className="mt-2">
          {renderColumnContent('left')}
        </TabsContent>
        <TabsContent value="right" className="mt-2">
          {renderColumnContent('right')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
