import { Toaster } from 'react-hot-toast'
import { cn } from '@renderer/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import hero from '../assets/hero.svg?asset'

import { Loader2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { SettingsProvider, useSettings } from '@renderer/contexts/SettingsContext'
import { UpdateProvider } from '@renderer/contexts/UpdateContext'
import { ThemeProvider } from '@renderer/contexts/ThemeContext'
import { PoweredBy } from '@renderer/components/brand/PowredBy'
import { OnboardingWizard } from '@renderer/components/onboarding/OnboardingWizard'
import { MainLayout } from '@renderer/components/layout/MainLayout'

const SplashScreen = ({ error }: { error?: string }) => {
  const { data: appVersion, isLoading: isLoadingAppVersion } = useQuery({
    ...queries.app.version
  })
  const hasError = !!error

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="text-8xl font-bold relative">
        Op Notes
        {!isLoadingAppVersion && appVersion && (
          <span className="absolute text-sm text-secondary-foreground top-0">v{appVersion}</span>
        )}
      </div>
      <img src={hero} alt="logo" className="w-72 h-72 animate-fade-in" />
      <div className={cn('text-xl p-2', hasError ? 'text-red-500' : 'text-primary-500')}>
        {!hasError ? (
          <div className="flex justify-center items-center">
            <Loader2Icon className="w-5 h-5 animate-spin mr-1" />
            Starting...
          </div>
        ) : (
          <div className="flex flex-col text-center">
            <div className="text-red-600">Failed to start the application!</div>
            <div className="text-sm text-red-500">{error}</div>
          </div>
        )}
      </div>
      <PoweredBy />
    </div>
  )
}

const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings()

  // Wait for settings to load
  const settingsLoaded = Object.keys(settings).length > 0
  if (!settingsLoaded) {
    return null
  }

  // Show wizard if onboarding not completed
  const showOnboarding = settings['onboarding_completed'] !== 'true'

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => {}} />
  }

  return <>{children}</>
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <UpdateProvider>
          <OnboardingGate>{children}</OnboardingGate>
        </UpdateProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default function Root() {
  const { mutate, isPending, isIdle, isSuccess, isError, error } = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await window.electronApi.boot()
      return true
    }
  })

  useEffect(() => {
    let cancelled = false

    if (!cancelled) {
      mutate()
    }

    return () => {
      cancelled = true
    }
  }, [mutate])

  const isBooting = isPending || isIdle || isError

  return (
    <>
      <main className="h-screen w-full flex antialiased bg-background overflow-hidden">
        {isBooting && <SplashScreen error={error?.message} />}
        {!isBooting && isSuccess && (
          <Providers>
            <MainLayout />
          </Providers>
        )}
      </main>
      <Toaster position="bottom-right" />
    </>
  )
}
