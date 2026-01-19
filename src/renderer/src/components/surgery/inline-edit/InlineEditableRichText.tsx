import { cn, isEmptyHtml } from '@renderer/lib/utils'
import { RichTextEditor } from '@renderer/components/common/RichTextEditor'
import { InlineEditableField } from './InlineEditableField'
import { useState, useCallback } from 'react'

export interface InlineEditableRichTextProps {
  /** Current HTML content */
  value: string | null | undefined
  /** Called when content is saved */
  onSave: (content: string) => Promise<void>
  /** Placeholder for empty state */
  emptyPlaceholder?: string
  /** Whether to show template button in editor */
  showTemplateButton?: boolean
  /** Additional class name */
  className?: string
}

// Rich text content display component
const RichTextContent = ({ content, className }: { content: string; className?: string }) => (
  <div
    className={cn(
      'prose prose-lead:normal prose-p:m-0 prose-li:m-0 [overflow-wrap:anywhere] dark:prose-invert prose-sm sm:prose-base',
      'focus:outline-none max-w-none',
      className
    )}
    dangerouslySetInnerHTML={{ __html: content || '' }}
  />
)

export const InlineEditableRichText = ({
  value,
  onSave,
  emptyPlaceholder = 'Click to add content...',
  showTemplateButton = true,
  className
}: InlineEditableRichTextProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedContent, setEditedContent] = useState<string>(value || '')

  const isEmpty = isEmptyHtml(value)

  const handleEdit = useCallback(() => {
    setEditedContent(value || '')
    setIsEditing(true)
  }, [value])

  const handleCancel = useCallback(() => {
    setEditedContent(value || '')
    setIsEditing(false)
  }, [value])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(editedContent)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }, [editedContent, onSave])

  const handleEditorUpdate = useCallback((content: string) => {
    setEditedContent(content)
  }, [])

  return (
    <InlineEditableField
      isEmpty={isEmpty}
      emptyPlaceholder={emptyPlaceholder}
      isEditing={isEditing}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={isSaving}
      className={className}
      editor={
        <RichTextEditor
          initialContent={editedContent}
          onUpdate={handleEditorUpdate}
          showTemplateButton={showTemplateButton}
          editorClassName="border m-1 rounded-md overflow-y-auto max-h-64 min-h-32"
        />
      }
    >
      <RichTextContent content={value || ''} />
    </InlineEditableField>
  )
}
