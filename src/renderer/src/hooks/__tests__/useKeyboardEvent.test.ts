import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardEvent } from '../useKeyboardEvent'

describe('useKeyboardEvent', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should add event listeners on mount', () => {
    renderHook(() =>
      useKeyboardEvent({
        key: 'Enter',
        onKeyDown: vi.fn()
      })
    )

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardEvent({
        key: 'Enter',
        onKeyDown: vi.fn()
      })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })

  it('should call onKeyDown when key is pressed', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'Enter',
        onKeyDown
      })
    )

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false
    })

    window.dispatchEvent(event)

    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should call onKeyUp when key is released', () => {
    const onKeyUp = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'Escape',
        onKeyUp
      })
    )

    const event = new KeyboardEvent('keyup', {
      key: 'Escape',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false
    })

    window.dispatchEvent(event)

    expect(onKeyUp).toHaveBeenCalled()
  })

  it('should not call callback when wrong key is pressed', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'Enter',
        onKeyDown
      })
    )

    const event = new KeyboardEvent('keydown', {
      key: 'Escape'
    })

    window.dispatchEvent(event)

    expect(onKeyDown).not.toHaveBeenCalled()
  })

  it('should require Ctrl key when specified', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'k',
        ctrlKey: true,
        onKeyDown
      })
    )

    // Without Ctrl
    const eventWithoutCtrl = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: false
    })
    window.dispatchEvent(eventWithoutCtrl)
    expect(onKeyDown).not.toHaveBeenCalled()

    // With Ctrl
    const eventWithCtrl = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true
    })
    window.dispatchEvent(eventWithCtrl)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should require Shift key when specified', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'S',
        shiftKey: true,
        onKeyDown
      })
    )

    // Without Shift
    const eventWithoutShift = new KeyboardEvent('keydown', {
      key: 'S',
      shiftKey: false
    })
    window.dispatchEvent(eventWithoutShift)
    expect(onKeyDown).not.toHaveBeenCalled()

    // With Shift
    const eventWithShift = new KeyboardEvent('keydown', {
      key: 'S',
      shiftKey: true
    })
    window.dispatchEvent(eventWithShift)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should require Alt key when specified', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'n',
        altKey: true,
        onKeyDown
      })
    )

    // Without Alt
    const eventWithoutAlt = new KeyboardEvent('keydown', {
      key: 'n',
      altKey: false
    })
    window.dispatchEvent(eventWithoutAlt)
    expect(onKeyDown).not.toHaveBeenCalled()

    // With Alt
    const eventWithAlt = new KeyboardEvent('keydown', {
      key: 'n',
      altKey: true
    })
    window.dispatchEvent(eventWithAlt)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should require Meta key when specified', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'k',
        metaKey: true,
        onKeyDown
      })
    )

    // Without Meta
    const eventWithoutMeta = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: false
    })
    window.dispatchEvent(eventWithoutMeta)
    expect(onKeyDown).not.toHaveBeenCalled()

    // With Meta
    const eventWithMeta = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true
    })
    window.dispatchEvent(eventWithMeta)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should handle multiple modifier keys', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        onKeyDown
      })
    )

    // Missing Shift
    const eventMissingShift = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: false
    })
    window.dispatchEvent(eventMissingShift)
    expect(onKeyDown).not.toHaveBeenCalled()

    // Both modifiers
    const eventWithBoth = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true
    })
    window.dispatchEvent(eventWithBoth)
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('should prevent default when key matches', () => {
    const onKeyDown = vi.fn()

    renderHook(() =>
      useKeyboardEvent({
        key: 'k',
        ctrlKey: true,
        onKeyDown
      })
    )

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
