import { BrowserWindow, ipcMain } from 'electron'
import electronUpdater, { type AppUpdater, type UpdateInfo } from 'electron-updater'
import { createBackup } from './backup'
import { getAllSettings, updateSetting } from './repository/app-settings'

export type UpdateChannel = 'stable' | 'beta' | 'alpha'

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

async function getUpdateChannelFromSettings(): Promise<UpdateChannel> {
  try {
    const settings = await getAllSettings()
    const channelSetting = settings.find((s) => s.key === 'update_channel')
    const channel = channelSetting?.value as UpdateChannel
    if (channel && ['stable', 'beta', 'alpha'].includes(channel)) {
      return channel
    }
  } catch (e) {
    console.error('Failed to get update channel from settings:', e)
  }
  return 'stable' // default to stable
}

async function applyUpdateChannel(): Promise<void> {
  if (!autoUpdater) return
  const channel = await getUpdateChannelFromSettings()
  // For stable, we use 'latest' which is the default
  // For beta/alpha, we set allowPrerelease and the channel
  if (channel === 'stable') {
    autoUpdater.channel = 'latest'
    autoUpdater.allowPrerelease = false
  } else {
    autoUpdater.channel = channel
    autoUpdater.allowPrerelease = true
  }
}

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
    // Apply channel settings before checking
    await applyUpdateChannel()
    return await autoUpdater.checkForUpdates()
  })

  ipcMain.handle('getUpdateChannel', async () => {
    return await getUpdateChannelFromSettings()
  })

  ipcMain.handle('setUpdateChannel', async (_event, channel: UpdateChannel) => {
    if (!['stable', 'beta', 'alpha'].includes(channel)) {
      throw new Error('Invalid update channel')
    }
    await updateSetting('update_channel', channel)
    await applyUpdateChannel()
    return channel
  })

  ipcMain.handle('downloadUpdate', async () => {
    if (!autoUpdater) {
      throw new Error('Auto updater not initialized')
    }
    await autoUpdater.downloadUpdate()
  })

  ipcMain.handle('quitAndInstall', async () => {
    if (!autoUpdater) {
      throw new Error('Auto updater not initialized')
    }
    // Always backup before update
    try {
      await createBackup('pre-update')
    } catch (e) {
      console.error('Pre-update backup failed:', e)
    }
    autoUpdater.quitAndInstall()
  })
}
