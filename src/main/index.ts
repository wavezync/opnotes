import { app, shell, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { db, migrateToLatest } from './db'
import { registerApi } from './api'
import { setupAutoUpdater, registerUpdaterIpcHandlers } from './updater'
import { initBackupScheduler, stopBackupScheduler, exportBackupToPath } from './backup'

import { PrintDialogArgs } from '../preload/interfaces'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      spellcheck: true
    }
  })

  mainWindow.on('ready-to-show', async () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/' })
  }

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()

    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(
        new MenuItem({
          label: suggestion,
          click: () => mainWindow.webContents.replaceMisspelling(suggestion)
        })
      )
    }

    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () =>
            mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }

    menu.popup()
  })

  mainWindow.webContents.on('did-finish-load', () => {})

  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

function createPrinterWindow() {
  // Create the browser window.
  const workerWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    workerWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/print.html`)
  } else {
    workerWindow.loadFile(join(__dirname, '../renderer/print.html'))
  }

  return workerWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.wavezync.opnotes')

  // Setup auto-updater with custom event handlers
  const autoUpdater = setupAutoUpdater()
  registerUpdaterIpcHandlers()

  // Check for updates after a short delay to allow the window to initialize
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('Failed to check for updates:', err)
    })
  }, 3000)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  registerApi()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.handle('appVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('boot', async () => {
    await migrateToLatest(db)
    await initBackupScheduler()

    return true
  })

  ipcMain.handle('selectBackupFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Backup Folder'
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('selectBackupFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Select Backup File to Restore',
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('saveBackupAs', async (_event, sourcePath?: string, defaultFilename?: string) => {
    const filename =
      defaultFilename ||
      `opnotes_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.db`

    const result = await dialog.showSaveDialog({
      title: 'Save Backup As',
      defaultPath: filename,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }

    // If sourcePath is provided, copy that file; otherwise export current DB
    if (sourcePath) {
      const { copyFile } = await import('fs/promises')
      try {
        await copyFile(sourcePath, result.filePath)
        return { success: true, path: result.filePath }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    return await exportBackupToPath(result.filePath)
  })

  ipcMain.handle('restartApp', () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle('printDialog', async (event, options: PrintDialogArgs) => {
    const workerWindow = createPrinterWindow()
    workerWindow.once('ready-to-show', () => {
      const windowTitle = options.title || 'Print Preview'
      workerWindow.setTitle(windowTitle)

      workerWindow.webContents.send('printData', options)
      workerWindow.show()
      // open devtools

      if (is.dev) {
        workerWindow.webContents.openDevTools()
      }
    })
  })
})

// Stop backup scheduler before quitting
app.on('before-quit', () => {
  stopBackupScheduler()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
