import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { UpdateStatus, UpdateStatusPayload } from '../../../preload/interfaces'

// Development mode simulation - set to true to test update UI states
const DEV_SIMULATE_UPDATE = false
const DEV_SIMULATE_STATE: UpdateStatus = 'available' // 'checking' | 'available' | 'downloading' | 'ready' | 'error'

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

// Helper to get simulated progress based on state
const getSimulatedProgress = (): UpdateStatusPayload['progress'] | undefined => {
  if (!DEV_SIMULATE_UPDATE) return undefined
  if ((DEV_SIMULATE_STATE as UpdateStatus) === 'downloading') {
    return { percent: 45, bytesPerSecond: 1250000, transferred: 12500000, total: 28000000 }
  }
  return undefined
}

// Helper to get simulated error based on state
const getSimulatedError = (): string | undefined => {
  if (!DEV_SIMULATE_UPDATE) return undefined
  if ((DEV_SIMULATE_STATE as UpdateStatus) === 'error') return 'Network connection failed'
  return undefined
}

export const UpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<UpdateStatus>(DEV_SIMULATE_UPDATE ? DEV_SIMULATE_STATE : 'idle')
  const [updateInfo, setUpdateInfo] = useState<UpdateStatusPayload['updateInfo']>(
    DEV_SIMULATE_UPDATE ? { version: '2.1.0', releaseName: 'Performance & Reliability Update' } : undefined
  )
  const [progress, setProgress] = useState<UpdateStatusPayload['progress']>(getSimulatedProgress())
  const [error, setError] = useState<string | undefined>(getSimulatedError())

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
