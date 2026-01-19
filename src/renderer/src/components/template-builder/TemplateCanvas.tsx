import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { TemplateBlock } from '../../../../shared/types/template-blocks'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { BlockPreview } from './BlockPreview'

interface SortableBlockProps {
  block: TemplateBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

const SortableBlock = ({ block, isSelected, onSelect, onDelete }: SortableBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: block.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        'bg-card rounded-md border',
        'transition-all duration-150',
        isSelected && 'ring-2 ring-primary border-primary',
        !isSelected && 'hover:border-primary/50',
        isDragging && 'opacity-50 shadow-lg z-50'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-6',
          'flex items-center justify-center',
          'cursor-grab active:cursor-grabbing',
          'text-muted-foreground',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:text-foreground'
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Block content */}
      <div className="pl-6 pr-8 py-2 min-h-[40px]">
        <BlockPreview block={block} />
      </div>

      {/* Delete button */}
      <div
        className={cn(
          'absolute right-1 top-1',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

interface TemplateCanvasProps {
  blocks: TemplateBlock[]
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onDeleteBlock: (id: string) => void
}

export const TemplateCanvas = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock
}: TemplateCanvasProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable'
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 p-4 overflow-y-auto bg-muted/30',
        'min-h-0'
      )}
      onClick={() => onSelectBlock(null)}
    >
      <div
        className={cn(
          'max-w-3xl mx-auto',
          'bg-background rounded-lg border shadow-sm',
          'min-h-[400px] p-4',
          isOver && 'ring-2 ring-primary ring-dashed'
        )}
      >
        {blocks.length === 0 ? (
          <div
            className={cn(
              'h-full min-h-[300px]',
              'flex items-center justify-center',
              'border-2 border-dashed border-muted-foreground/25 rounded-lg',
              isOver && 'border-primary bg-primary/5'
            )}
          >
            <div className="text-center text-muted-foreground">
              <p className="font-medium">Drag blocks here</p>
              <p className="text-sm">to build your print template</p>
            </div>
          </div>
        ) : (
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
