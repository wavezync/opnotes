/**
 * Platform detection utilities for keyboard shortcuts display
 * Uses Electron's process.platform exposed via preload
 */

const platform = window.electronApi?.platform

/**
 * Whether the current platform is macOS
 */
export const isMac = platform === 'darwin'

/**
 * Returns the appropriate modifier key symbol for the current platform
 * - Mac: ⌘ (Command)
 * - Windows/Linux: Ctrl
 */
export const modKey = isMac ? '⌘' : 'Ctrl'
