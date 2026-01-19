import { cn } from '@renderer/lib/utils'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Check, X, Pencil } from 'lucide-react'
import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'

export interface InlineEditableTextProps {
  /** Current value */
  value: string | null | undefined
  /** Called when value is saved */
  onSave: (value: string) => Promise<void>
  /** Placeholder for empty state */
  emptyPlaceholder?: string
  /** Placeholder for input */
  inputPlaceholder?: string
  /** Whether the text should be displayed as monospace */
  mono?: boolean
  /** Additional class name */
  className?: string
}

export const InlineEditableText = ({
  value,
  onSave,
  emptyPlaceholder = 'Click to add...',
  inputPlaceholder = 'Enter value...',
  mono = false,
  className
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedValue, setEditedValue] = useState<string>(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const isEmpty = !value || value.trim().length === 0

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleEdit = useCallback(() => {
    setEditedValue(value || '')
    setIsEditing(true)
  }, [value])

  const handleCancel = useCallback(() => {
    setEditedValue(value || '')
    setIsEditing(false)
  }, [value])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(editedValue)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }, [editedValue, onSave])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  // View mode
  if (!isEditing) {
    return (
      <div
        className={cn(
          'group inline-flex items-center gap-2 cursor-pointer transition-all duration-200 rounded px-1 -mx-1',
          isEmpty ? 'text-muted-foreground/60' : '',
          'hover:bg-accent/50',
          className
        )}
        onClick={handleEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleEdit()
          }
        }}
      >
        <span className={cn('text-sm font-medium', mono && 'font-mono')}>
          {isEmpty ? emptyPlaceholder : value}
        </span>
        <Pencil className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  // Edit mode
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        ref={inputRef}
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={inputPlaceholder}
        className={cn('h-8 text-sm', mono && 'font-mono')}
        disabled={isSaving}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation()
          handleCancel()
        }}
        disabled={isSaving}
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        variant="default"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation()
          handleSave()
        }}
        disabled={isSaving}
      >
        <Check className="h-4 w-4" />
      </Button>
    </div>
  )
}
