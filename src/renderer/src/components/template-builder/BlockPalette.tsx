import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Building2,
  Type,
  Tag,
  Table,
  FileText,
  Minus,
  MoveVertical,
  Users,
  GitBranch,
  Columns2,
  Image,
  ChevronDown,
  SeparatorHorizontal
} from 'lucide-react'
import { BlockDefinition, BlockType } from '../../../../shared/types/template-blocks'
import { BLOCKS_BY_CATEGORY, CATEGORY_LABELS } from '../../../../shared/constants/template-fields'
import { cn } from '../../lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible'
import { useState } from 'react'

// Icon mapping for block types
const blockIcons: Record<string, React.ElementType> = {
  Building2,
  Type,
  Tag,
  Table,
  FileText,
  Minus,
  MoveVertical,
  Users,
  GitBranch,
  Columns2,
  Image,
  SeparatorHorizontal
}

interface DraggableBlockProps {
  block: BlockDefinition
}

const DraggableBlock = ({ block }: DraggableBlockProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.type}`,
    data: {
      type: 'palette-block',
      blockType: block.type as BlockType,
      defaultProps: block.defaultProps
    }
  })

  const Icon = blockIcons[block.icon] || Type

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : undefined
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md',
        'bg-card border border-border',
        'cursor-grab active:cursor-grabbing',
        'hover:border-primary hover:shadow-sm',
        'transition-all duration-150',
        isDragging && 'opacity-50 scale-102 shadow-lg'
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium truncate">{block.label}</span>
    </div>
  )
}

interface CategorySectionProps {
  category: string
  blocks: BlockDefinition[]
  defaultOpen?: boolean
}

const CategorySection = ({ category, blocks, defaultOpen = true }: CategorySectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <span>{CATEGORY_LABELS[category] || category}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', isOpen ? 'rotate-180' : '')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1.5 pt-1">
        {blocks.map((block) => (
          <DraggableBlock key={block.type} block={block} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export const BlockPalette = () => {
  const categories = ['structure', 'content', 'data', 'logic']

  return (
    <div className="w-60 flex-shrink-0 border-r bg-background overflow-y-auto">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Blocks</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drag to add to template</p>
      </div>
      <div className="p-2 space-y-3">
        {categories.map((category) => {
          const blocks = BLOCKS_BY_CATEGORY[category]
          if (!blocks || blocks.length === 0) return null
          return (
            <CategorySection
              key={category}
              category={category}
              blocks={blocks}
              defaultOpen={category === 'structure' || category === 'content'}
            />
          )
        })}
      </div>
    </div>
  )
}
