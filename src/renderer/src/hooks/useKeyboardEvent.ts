import { useCallback, useEffect } from 'react'

export interface UseKeyboardEventOptions {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  onKeyDown?: () => void
  onKeyUp?: () => void
}

export const useKeyboardEvent = ({
  key,
  altKey,
  ctrlKey,
  metaKey,
  shiftKey,
  onKeyDown,
  onKeyUp
}: UseKeyboardEventOptions) => {
  const isKeyPressed = useCallback(
    (event: KeyboardEvent) =>
      (!altKey || event.altKey) &&
      (!ctrlKey || event.ctrlKey) &&
      (!metaKey || event.metaKey) &&
      (!shiftKey || event.shiftKey) &&
      event.key === key,
    [altKey, ctrlKey, key, metaKey, shiftKey]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (onKeyDown && isKeyPressed(event)) {
        event.preventDefault()
        onKeyDown()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (onKeyUp && isKeyPressed(event)) {
        event.preventDefault()
        onKeyUp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [key, onKeyDown, onKeyUp, isKeyPressed])

  return null
}
