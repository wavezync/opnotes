import { ElectronAPI } from '@electron-toolkit/preload'
import type { ApiType } from '../main/api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      invoke: <K extends keyof ApiType>(
        method: K,
        ...args: ArgumentTypes<ApiType[K]>
      ) => Promise<ResultType<UnwrapPromise<ReturnType<ApiType[K]>>, ErrorType>>
    }
  }
}
