import { ElectronAPI } from '@electron-toolkit/preload'
import type { ApiType } from '../main/api'
import { PrintDialogArgs, UpdateStatusPayload } from './interfaces'

type ElectronApi = ElectronAPI & {
  platform: NodeJS.Platform
  getAppVersion: () => Promise<string>
  boot: () => Promise<boolean>
  openPrintDialog: (options: PrintDialogArgs) => Promise<void>
  onPrintData: (callback: (options: PrintDialogArgs) => void) => void
  checkForUpdates: () => Promise<unknown>
  downloadUpdate: () => Promise<void>
  quitAndInstall: () => Promise<void>
  showDownloadedUpdate: () => Promise<void>
  onUpdateStatus: (callback: (payload: UpdateStatusPayload) => void) => () => void
  getUpdateChannel: () => Promise<'stable' | 'beta' | 'alpha'>
  setUpdateChannel: (channel: 'stable' | 'beta' | 'alpha') => Promise<string>
  selectBackupFolder: () => Promise<string | null>
  selectBackupFile: () => Promise<string | null>
  saveBackupAs: (
    sourcePath?: string,
    defaultFilename?: string
  ) => Promise<{
    success: boolean
    path?: string
    canceled?: boolean
    error?: string
  }>
  restartApp: () => Promise<void>
}

declare global {
  interface Window {
    electronApi: ElectronApi
    api: {
      invoke: <K extends keyof ApiType>(
        method: K,
        ...args: ArgumentTypes<ApiType[K]>
      ) => Promise<ResultType<UnwrapPromise<ReturnType<ApiType[K]>>, ErrorType>>
    }
  }
}
