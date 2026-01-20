import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  TemplateBlock,
  TemplateStructure,
  TemplateType,
  BlockType
} from '../../../../shared/types/template-blocks'
import { BLOCK_DEFINITIONS } from '../../../../shared/constants/template-fields'
import { BlockPalette } from './BlockPalette'
import { TemplateCanvas } from './TemplateCanvas'
import { PropertyPanel } from './PropertyPanel'
import { LivePreview } from './LivePreview'
import { SampleDataProvider } from './SampleDataContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface TemplateBuilderProps {
  templateStructure: TemplateStructure
  templateType: TemplateType
  onChange: (structure: TemplateStructure) => void
}

export const TemplateBuilder = ({
  templateStructure,
  templateType,
  onChange
}: TemplateBuilderProps) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  const selectedBlock = selectedBlockId
    ? templateStructure.blocks.find((b) => b.id === selectedBlockId) || null
    : null

  const generateId = () => crypto.randomUUID()

  const createBlockFromType = (blockType: BlockType): TemplateBlock => {
    const definition = BLOCK_DEFINITIONS.find((b) => b.type === blockType)
    const defaultProps = definition?.defaultProps || {}
    const id = generateId()

    // Handle special block types with children/columns
    if (blockType === 'conditional') {
      return {
        id,
        type: 'conditional',
        props: defaultProps as unknown,
        children: []
      } as TemplateBlock
    }

    if (blockType === 'two-column') {
      return {
        id,
        type: 'two-column',
        props: defaultProps as unknown,
        left: [],
        right: []
      } as TemplateBlock
    }

    return {
      id,
      type: blockType,
      props: defaultProps as unknown
    } as TemplateBlock
  }

  const updateBlocks = useCallback(
    (blocks: TemplateBlock[]) => {
      onChange({
        ...templateStructure,
        blocks
      })
    },
    [templateStructure, onChange]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)

    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overId = over.id as string

    // Dragging from palette to canvas
    if (activeData?.type === 'palette-block') {
      const blockType = activeData.blockType as BlockType
      const newBlock = createBlockFromType(blockType)

      // Find insertion position
      const overIndex = templateStructure.blocks.findIndex((b) => b.id === overId)
      const insertIndex = overIndex >= 0 ? overIndex + 1 : templateStructure.blocks.length

      const newBlocks = [...templateStructure.blocks]
      newBlocks.splice(insertIndex, 0, newBlock)
      updateBlocks(newBlocks)
      setSelectedBlockId(newBlock.id)
      return
    }

    // Reordering within canvas
    if (active.id !== over.id) {
      const oldIndex = templateStructure.blocks.findIndex((b) => b.id === active.id)
      const newIndex = templateStructure.blocks.findIndex((b) => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        updateBlocks(arrayMove(templateStructure.blocks, oldIndex, newIndex))
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current

    // If dragging from palette and dropping on empty canvas
    if (
      activeData?.type === 'palette-block' &&
      over.id === 'canvas-droppable' &&
      templateStructure.blocks.length === 0
    ) {
      const blockType = activeData.blockType as BlockType
      const newBlock = createBlockFromType(blockType)
      updateBlocks([newBlock])
      setSelectedBlockId(newBlock.id)
    }
  }

  const handleSelectBlock = (id: string | null) => {
    setSelectedBlockId(id)
  }

  const handleDeleteBlock = (id: string) => {
    updateBlocks(templateStructure.blocks.filter((b) => b.id !== id))
    if (selectedBlockId === id) {
      setSelectedBlockId(null)
    }
  }

  const handleUpdateBlock = (updatedBlock: TemplateBlock) => {
    updateBlocks(
      templateStructure.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    )
  }

  return (
    <SampleDataProvider templateType={templateType}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex h-full">
          {/* Left Panel: Block Palette */}
          <BlockPalette />

          {/* Center Panel: Canvas/Preview */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-shrink-0 px-4 py-2 border-b bg-background">
                <TabsList className="h-8">
                  <TabsTrigger value="edit" className="text-xs px-3">
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs px-3">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="flex-1 m-0 overflow-hidden">
                <TemplateCanvas
                  blocks={templateStructure.blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={handleSelectBlock}
                  onDeleteBlock={handleDeleteBlock}
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <LivePreview templateStructure={templateStructure} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel: Properties */}
          <PropertyPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={handleUpdateBlock}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragId && (
            <div className="bg-card border border-primary shadow-lg rounded-md px-3 py-2 opacity-80">
              <span className="text-sm font-medium">
                {activeDragId.startsWith('palette-')
                  ? activeDragId.replace('palette-', '')
                  : 'Block'}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </SampleDataProvider>
  )
}
