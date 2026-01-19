import { cn, formatDate } from '@renderer/lib/utils'
import { Button } from '@renderer/components/ui/button'
import { Calendar } from '@renderer/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Pencil, X } from 'lucide-react'
import { useState, useCallback } from 'react'

export interface InlineEditableDateProps {
  /** Current date value */
  value: Date | null | undefined
  /** Called when date is saved */
  onSave: (value: Date | null) => Promise<void>
  /** Placeholder for empty state */
  emptyPlaceholder?: string
  /** Additional class name */
  className?: string
}

export const InlineEditableDate = ({
  value,
  onSave,
  emptyPlaceholder = 'Select date...',
  className
}: InlineEditableDateProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isEmpty = !value

  const handleSelect = useCallback(
    async (date: Date | undefined) => {
      setIsSaving(true)
      try {
        await onSave(date || null)
        setIsOpen(false)
      } finally {
        setIsSaving(false)
      }
    },
    [onSave]
  )

  const handleClear = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsSaving(true)
      try {
        await onSave(null)
        setIsOpen(false)
      } finally {
        setIsSaving(false)
      }
    },
    [onSave]
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'group inline-flex items-center gap-2 cursor-pointer transition-all duration-200 rounded px-1 -mx-1',
            isEmpty ? 'text-muted-foreground/60' : '',
            'hover:bg-accent/50',
            className
          )}
          role="button"
          tabIndex={0}
        >
          <span className="text-sm font-medium">
            {isEmpty ? emptyPlaceholder : formatDate(value)}
          </span>
          <Pencil className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={handleSelect}
          initialFocus
          disabled={isSaving}
        />
        {value && (
          <div className="px-3 pb-3 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleClear}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
