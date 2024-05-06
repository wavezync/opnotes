import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button, ButtonProps } from '../ui/button'
import { cn } from '@renderer/lib/utils'
import {
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  RedoIcon,
  StrikethroughIcon,
  UndoIcon
} from 'lucide-react'
import { useEffect } from 'react'
import Placeholder from '@tiptap/extension-placeholder'

interface ToolbarButtonProps extends ButtonProps {
  isActive?: boolean
}

const ToolbarButton = ({ isActive, children, onClick, ...rest }: ToolbarButtonProps) => {
  return (
    <Button
      className={cn(isActive && `bg-accent`)}
      size={'icon'}
      variant={'outline'}
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}

const MenuBar = ({ editor }: any) => {
  if (!editor) {
    return null
  }

  return (
    <div className="w-full flex">
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
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="p-1 border-r border-border w-fit flex space-x-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
        >
          <PilcrowIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
        >
          <Heading1Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
        >
          <Heading3Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
        >
          <Heading4Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          isActive={editor.isActive('heading', { level: 5 })}
        >
          <Heading5Icon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          isActive={editor.isActive('heading', { level: 6 })}
        >
          <Heading6Icon className="h-4 w-4" />
        </ToolbarButton>
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
        class: 'prose dark:prose-invert prose-sm sm:prose-base m-2 focus:outline-none max-w-none'
      }
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onUpdate?.(html)
    }
  })

  useEffect(() => {
    if (!editor) return
    let { from, to } = editor.state.selection
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
