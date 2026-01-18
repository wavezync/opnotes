import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PrintDialogArgs, UpdateStatusPayload } from './interfaces'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

const invoke = async (method, ...args) => {
  return await ipcRenderer.invoke('invokeApiCall', method, ...args)
}

const api = {
  invoke
}

const getAppVersion = async () => {
  return await ipcRenderer.invoke('appVersion')
}

const boot = async () => {
  return await ipcRenderer.invoke('boot')
}

const openPrintDialog = async (options: PrintDialogArgs) => {
  return await ipcRenderer.invoke('printDialog', options)
}

const onPrintData = (callback: (options: PrintDialogArgs) => void) =>
  ipcRenderer.on('printData', (_, options) => callback(options))

const checkForUpdates = async () => {
  return await ipcRenderer.invoke('checkForUpdates')
}

const downloadUpdate = async () => {
  return await ipcRenderer.invoke('downloadUpdate')
}

const quitAndInstall = () => {
  return ipcRenderer.invoke('quitAndInstall')
}

const onUpdateStatus = (callback: (payload: UpdateStatusPayload) => void) => {
  const handler = (_: Electron.IpcRendererEvent, payload: UpdateStatusPayload) => callback(payload)
  ipcRenderer.on('update-status', handler)
  return () => {
    ipcRenderer.removeListener('update-status', handler)
  }
}

const selectBackupFolder = async (): Promise<string | null> => {
  return await ipcRenderer.invoke('selectBackupFolder')
}

const selectBackupFile = async (): Promise<string | null> => {
  return await ipcRenderer.invoke('selectBackupFile')
}

const saveBackupAs = async (
  sourcePath?: string,
  defaultFilename?: string
): Promise<{
  success: boolean
  path?: string
  canceled?: boolean
  error?: string
}> => {
  return await ipcRenderer.invoke('saveBackupAs', sourcePath, defaultFilename)
}

const restartApp = async (): Promise<void> => {
  return await ipcRenderer.invoke('restartApp')
}

const electronApi = {
  ...electronAPI,
  platform: process.platform,
  getAppVersion,
  boot,
  openPrintDialog,
  onPrintData,
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  onUpdateStatus,
  selectBackupFolder,
  selectBackupFile,
  saveBackupAs,
  restartApp
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronApi', electronApi)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronApi = electronApi
  // @ts-ignore (define in dts)
  window.api = api
}
