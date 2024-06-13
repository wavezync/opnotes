import { ElectronAPI } from '@electron-toolkit/preload'
import type { ApiType } from '../main/api'
import { PrintDialogArgs } from './interfaces'

type ElectronApi = ElectronAPI & {
  getAppVersion: () => Promise<string>
  boot: () => Promise<boolean>
  openPrintDialog: (options: PrintDialogArgs) => Promise<void>
  onPrintData: (callback: (options: PrintDialogArgs) => void) => void
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
