import { BrowserWindow, ipcMain } from 'electron'
import electronUpdater, { type AppUpdater, type UpdateInfo } from 'electron-updater'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'

export interface UpdateStatusPayload {
  status: UpdateStatus
  updateInfo?: UpdateInfo
  progress?: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  }
  error?: string
}

let autoUpdater: AppUpdater | null = null

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows()
  return windows.length > 0 ? windows[0] : null
}

function sendUpdateStatus(payload: UpdateStatusPayload): void {
  const mainWindow = getMainWindow()
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', payload)
  }
}

export function setupAutoUpdater(): AppUpdater {
  const { autoUpdater: updater } = electronUpdater
  const log = require('electron-log')
  log.transports.file.level = 'debug'
  updater.logger = log

  updater.autoDownload = false
  updater.autoInstallOnAppQuit = true

  autoUpdater = updater

  updater.on('checking-for-update', () => {
    sendUpdateStatus({ status: 'checking' })
  })

  updater.on('update-available', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'available', updateInfo: info })
  })

  updater.on('update-not-available', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'not-available', updateInfo: info })
  })

  updater.on('download-progress', (progress) => {
    sendUpdateStatus({
      status: 'downloading',
      progress: {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      }
    })
  })

  updater.on('update-downloaded', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'ready', updateInfo: info })
  })

  updater.on('error', (error: Error) => {
    sendUpdateStatus({ status: 'error', error: error.message })
  })

  return updater
}

export function registerUpdaterIpcHandlers(): void {
  ipcMain.handle('checkForUpdates', async () => {
    if (!autoUpdater) {
      throw new Error('Auto updater not initialized')
    }
    return await autoUpdater.checkForUpdates()
  })

  ipcMain.handle('downloadUpdate', async () => {
    if (!autoUpdater) {
      throw new Error('Auto updater not initialized')
    }
    await autoUpdater.downloadUpdate()
  })

  ipcMain.handle('quitAndInstall', () => {
    if (!autoUpdater) {
      throw new Error('Auto updater not initialized')
    }
    autoUpdater.quitAndInstall()
  })
}
