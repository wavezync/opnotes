import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { keyboardShortcuts } from '@renderer/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border shadow-sm">
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Quick keyboard shortcuts to navigate the app faster</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {keyboardShortcuts.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">{category.category}</h4>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && key !== '/' && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                          {key === '/' ? (
                            <span className="text-muted-foreground text-xs mx-1">or</span>
                          ) : (
                            <Kbd>{key}</Kbd>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Press <Kbd>⌘</Kbd> + <Kbd>/</Kbd> to toggle this help
        </div>
      </DialogContent>
    </Dialog>
  )
}
