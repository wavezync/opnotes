import { ElectronAPI } from '@electron-toolkit/preload'
import type { ApiType } from '../main/api'

type ElectronApi = ElectronAPI & {
  getAppVersion: () => Promise<string>
  boot: () => Promise<boolean>
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
