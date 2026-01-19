import { vi } from 'vitest'

// Mock electron module
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test-opnotes'),
    getName: vi.fn().mockReturnValue('op-notes-test'),
    getVersion: vi.fn().mockReturnValue('0.0.1-test')
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      openDevTools: vi.fn()
    },
    show: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn()
  })),
  shell: {
    openExternal: vi.fn(),
    openPath: vi.fn(),
    showItemInFolder: vi.fn()
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn()
  }
}))

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    transports: {
      file: { level: false },
      console: { level: false }
    }
  },
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn()
}))
