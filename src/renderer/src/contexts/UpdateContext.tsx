import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { UpdateStatus, UpdateStatusPayload } from '../../../preload/interfaces'

export interface UpdateContextType {
  status: UpdateStatus
  updateInfo?: UpdateStatusPayload['updateInfo']
  progress?: UpdateStatusPayload['progress']
  error?: string
  checkForUpdates: () => void
  downloadUpdate: () => void
  installUpdate: () => void
  dismissError: () => void
}

export const UpdateContext = createContext<UpdateContextType | null>(null)

export const UpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [updateInfo, setUpdateInfo] = useState<UpdateStatusPayload['updateInfo']>()
  const [progress, setProgress] = useState<UpdateStatusPayload['progress']>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    const cleanup = window.electronApi.onUpdateStatus((payload) => {
      setStatus(payload.status)

      if (payload.updateInfo) {
        setUpdateInfo(payload.updateInfo)
      }

      if (payload.progress) {
        setProgress(payload.progress)
      }

      if (payload.error) {
        setError(payload.error)
      }

      if (payload.status === 'not-available') {
        setTimeout(() => setStatus('idle'), 3000)
      }
    })

    return cleanup
  }, [])

  const checkForUpdates = useCallback(() => {
    window.electronApi.checkForUpdates().catch((err) => {
      console.error('Failed to check for updates:', err)
      setStatus('error')
      setError(err.message || 'Failed to check for updates')
    })
  }, [])

  const downloadUpdate = useCallback(() => {
    window.electronApi.downloadUpdate().catch((err) => {
      console.error('Failed to download update:', err)
      setStatus('error')
      setError(err.message || 'Failed to download update')
    })
  }, [])

  const installUpdate = useCallback(() => {
    window.electronApi.quitAndInstall()
  }, [])

  const dismissError = useCallback(() => {
    setStatus('idle')
    setError(undefined)
  }, [])

  const contextValue = useMemo(
    () => ({
      status,
      updateInfo,
      progress,
      error,
      checkForUpdates,
      downloadUpdate,
      installUpdate,
      dismissError
    }),
    [
      status,
      updateInfo,
      progress,
      error,
      checkForUpdates,
      downloadUpdate,
      installUpdate,
      dismissError
    ]
  )

  return <UpdateContext.Provider value={contextValue}>{children}</UpdateContext.Provider>
}

export const useUpdate = () => {
  const context = useContext(UpdateContext)

  if (!context) {
    throw new Error('useUpdate must be used within an UpdateProvider')
  }

  return context
}
