import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useMemo } from 'react'
import { queries } from '../lib/queries'

export interface SettingsContextType {
  settings: Record<string, string | null>
  appVersion?: string
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  appVersion: ''
})

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    ...queries.app.settings
  })
  const { data: appVersion } = useQuery({
    ...queries.app.version
  })

  const settings = useMemo(() => {
    if (isSettingsLoading) {
      return {}
    }
    if (!settingsData) {
      return {}
    }

    const settings =
      settingsData.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        },
        {} as Record<string, string | null>
      ) || {}
    return settings
  }, [settingsData, isSettingsLoading])

  const contextValue = useMemo(() => ({ settings, appVersion }), [settings, appVersion])

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }

  return context
}
