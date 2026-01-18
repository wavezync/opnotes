import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface KeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void
  onShowHelp?: () => void
}

export function useKeyboardShortcuts({ onOpenCommandPalette, onShowHelp }: KeyboardShortcutsOptions) {
  const navigate = useNavigate()
  const location = useLocation()
  const gKeyPressed = useRef(false)
  const gKeyTimeout = useRef<ReturnType<typeof setTimeout>>()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Handle g+<key> navigation shortcuts (vim-style)
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === 'g') {
          e.preventDefault()
          gKeyPressed.current = true
          // Clear after 500ms
          if (gKeyTimeout.current) {
            clearTimeout(gKeyTimeout.current)
          }
          gKeyTimeout.current = setTimeout(() => {
            gKeyPressed.current = false
          }, 500)
          return
        }

        if (gKeyPressed.current) {
          gKeyPressed.current = false
          if (gKeyTimeout.current) {
            clearTimeout(gKeyTimeout.current)
          }

          switch (e.key) {
            case 'h':
              e.preventDefault()
              navigate('/')
              return
            case 'p':
              e.preventDefault()
              navigate('/patients')
              return
            case 's':
              e.preventDefault()
              navigate('/surgeries')
              return
            case 'd':
              e.preventDefault()
              navigate('/doctors')
              return
            case 't':
              e.preventDefault()
              navigate('/settings')
              return
          }
        }
      }

      // Modifier key shortcuts
      const isMod = e.metaKey || e.ctrlKey

      // ⌘K - Command palette (handled in MainLayout, but this is a fallback)
      if (isMod && e.key === 'k') {
        e.preventDefault()
        onOpenCommandPalette?.()
        return
      }

      // ⌘/ - Show keyboard shortcuts help
      if (isMod && e.key === '/') {
        e.preventDefault()
        onShowHelp?.()
        return
      }

      // ⌘N - New item (context-aware)
      if (isMod && e.key === 'n' && !isInput) {
        e.preventDefault()
        // Context-aware new item
        if (location.pathname.startsWith('/patients')) {
          navigate('/patients/add')
        } else if (location.pathname.startsWith('/surgeries')) {
          navigate('/surgeries/add')
        } else if (location.pathname.startsWith('/doctors')) {
          navigate('/doctors/add')
        } else {
          // Default to new patient
          navigate('/patients/add')
        }
        return
      }

      // Escape - Navigate back or close modals
      if (e.key === 'Escape' && !isInput) {
        // This could trigger going back
        // window.history.back()
      }
    },
    [navigate, location.pathname, onOpenCommandPalette, onShowHelp]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (gKeyTimeout.current) {
        clearTimeout(gKeyTimeout.current)
      }
    }
  }, [handleKeyDown])
}

// Keyboard shortcuts definitions for the help modal
export const keyboardShortcuts = [
  {
    category: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['⌘', 'N'], description: 'New item (context-aware)' },
      { keys: ['Esc'], description: 'Close dialog / Cancel' }
    ]
  },
  {
    category: 'Navigation (press g then...)',
    shortcuts: [
      { keys: ['g', 'h'], description: 'Go to Dashboard' },
      { keys: ['g', 'p'], description: 'Go to Patients' },
      { keys: ['g', 's'], description: 'Go to Surgeries' },
      { keys: ['g', 'd'], description: 'Go to Doctors' },
      { keys: ['g', 't'], description: 'Go to Settings' }
    ]
  },
  {
    category: 'Tables',
    shortcuts: [
      { keys: ['↑', '/', 'k'], description: 'Move up' },
      { keys: ['↓', '/', 'j'], description: 'Move down' },
      { keys: ['Enter'], description: 'Open selected item' }
    ]
  }
]
