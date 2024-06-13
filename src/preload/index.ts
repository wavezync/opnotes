import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { PrintDialogArgs } from './interfaces'

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

const electronApi = {
  ...electronAPI,
  getAppVersion,
  boot,
  openPrintDialog,
  onPrintData
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
