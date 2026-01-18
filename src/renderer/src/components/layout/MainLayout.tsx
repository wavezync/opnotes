import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from '@renderer/components/command-palette/CommandPalette'
import { KeyboardShortcutsHelp } from '@renderer/components/keyboard/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from '@renderer/hooks/useKeyboardShortcuts'

export function MainLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  const handleSearchClick = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setCommandPaletteOpen((prev) => !prev),
    onShowHelp: () => setShortcutsHelpOpen((prev) => !prev)
  })

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onSearchClick={handleSearchClick} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
    </div>
  )
}
