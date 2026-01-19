import { cn } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Check, X, Pencil, Plus } from 'lucide-react'
import { useCallback, useEffect, useState, ReactNode } from 'react'

export interface InlineEditableFieldProps {
  /** Whether the field has no content */
  isEmpty: boolean
  /** Placeholder text for empty state */
  emptyPlaceholder?: string
  /** Whether currently in edit mode */
  isEditing: boolean
  /** Called when user wants to enter edit mode */
  onEdit: () => void
  /** Called when saving */
  onSave: () => Promise<void>
  /** Called when canceling edit */
  onCancel: () => void
  /** Whether save is in progress */
  isSaving: boolean
  /** Content to display in view mode */
  children: ReactNode
  /** Editor content to display in edit mode */
  editor: ReactNode
  /** Additional class names */
  className?: string
  /** Whether to show action buttons in footer or inline */
  actionsPosition?: 'footer' | 'inline'
}

export const InlineEditableField = ({
  isEmpty,
  emptyPlaceholder = 'Click to add...',
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  children,
  editor,
  className,
  actionsPosition = 'footer'
}: InlineEditableFieldProps) => {
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    setSaveError(null)
    try {
      await onSave()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    }
  }, [onSave])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
      // Cmd/Ctrl + Enter to save
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, onCancel, handleSave])

  // View mode
  if (!isEditing) {
    return (
      <div
        className={cn(
          'group relative cursor-pointer transition-all duration-200',
          isEmpty
            ? 'border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-muted-foreground/40 hover:bg-accent/30'
            : 'hover:bg-accent/20 rounded-lg',
          className
        )}
        onClick={onEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit()
          }
        }}
      >
        {isEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center mb-2 group-hover:bg-muted transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
              {emptyPlaceholder}
            </p>
          </div>
        ) : (
          // Content with hover hint
          <div className="relative">
            <div className="p-4 rounded-lg bg-accent/30">{children}</div>
            {/* Edit hint on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border text-xs text-muted-foreground">
                <Pencil className="h-3 w-3" />
                <span>Click to edit</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Edit mode
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-primary/50 ring-4 ring-primary/10 transition-all duration-200',
        className
      )}
    >
      <div className="p-1">{editor}</div>

      {actionsPosition === 'footer' && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t">
          <div className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd>
            <span className="ml-1">to cancel</span>
          </div>

          {saveError && <p className="text-xs text-destructive mx-4">{saveError}</p>}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onCancel()
              }}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleSave()
              }}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              <Check className="h-4 w-4 mr-1" />
              Save
              <kbd className="ml-2 px-1 py-0.5 rounded bg-primary-foreground/20 text-[10px] font-mono">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}↵
              </kbd>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
