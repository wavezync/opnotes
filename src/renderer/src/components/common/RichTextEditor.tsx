import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

import { cn } from '@renderer/lib/utils'
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon
} from 'lucide-react'
import { useEffect } from 'react'
import Placeholder from '@tiptap/extension-placeholder'
import { Toggle } from '../ui/toggle'
import { ToggleProps } from '@radix-ui/react-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ToolbarButtonProps extends ToggleProps {
  isActive?: boolean
}

const ToolbarButton = ({ isActive, children, onClick, ...rest }: ToolbarButtonProps) => {
  return (
    <Toggle
      className={cn(isActive && `bg-accent`)}
      variant={'outline'}
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
      }}
      {...rest}
    >
      {children}
    </Toggle>
  )
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="w-full flex flex-wrap">
      <div className="p-1 border-r border-border w-fit flex space-x-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <BoldIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <ItalicIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="p-1 border-r border-border w-fit flex space-x-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
        >
          <AlignLeftIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
        >
          <AlignCenterIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
        >
          <AlignRightIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
        >
          <AlignJustifyIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="p-1 border-r border-border w-fit flex space-x-1">
        <Select
          onValueChange={(value) => {
            if (value === 'heading') {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            } else if (value === 'subheading') {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            } else if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run()
            }
          }}
          value={
            editor.isActive('heading', { level: 2 })
              ? 'heading'
              : editor.isActive('heading', { level: 3 })
                ? 'subheading'
                : 'paragraph'
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Text Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="heading">Heading</SelectItem>
            <SelectItem value="subheading">Subheading</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-1 border-r border-border w-fit flex space-x-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <ListIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrderedIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="p-1 w-fit flex space-x-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <UndoIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <RedoIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false
    }
  }),
  Placeholder.configure({
    emptyEditorClass: 'is-editor-empty'
  }),
  Underline.configure(),
  TextAlign.configure({
    types: ['heading', 'paragraph']
  })
]

export interface RichTextEditorProps {
  initialContent?: string
  onUpdate?: (content: string) => void
}

export const RichTextEditor = ({ initialContent, onUpdate }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class:
          'prose prose-lead:normal prose-p:m-0 prose-li:m-0 [overflow-wrap:anywhere] dark:prose-invert prose-sm sm:prose-base m-2 focus:outline-none max-w-none'
      }
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onUpdate?.(html)
    }
  })

  useEffect(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.commands.setContent(initialContent || '', false, {
      preserveWhitespace: 'full'
    })
    editor.commands.setTextSelection({ from, to })
  }, [editor, initialContent])

  return (
    <div className="dark w-full">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="border m-1 rounded-md overflow-y-auto max-h-64 h-64"
      />
    </div>
  )
}
