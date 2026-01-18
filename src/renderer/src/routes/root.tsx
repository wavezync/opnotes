import { Toaster } from '@renderer/components/ui/sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import opnotesLogo from '../assets/opnotes-logo.png?asset'
import wavezyncLogoDark from '../../../../resources/wavezync-dark.png?asset'

import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { SettingsProvider, useSettings } from '@renderer/contexts/SettingsContext'
import { UpdateProvider } from '@renderer/contexts/UpdateContext'
import { ThemeProvider } from '@renderer/contexts/ThemeContext'
import { OnboardingWizard } from '@renderer/components/onboarding/OnboardingWizard'
import { MainLayout } from '@renderer/components/layout/MainLayout'

// Animated OpNotes logo with glow effects
const SplashIcon = () => (
  <div className="relative w-40 h-40 animate-splash-icon">
    {/* Outer glow ring */}
    <div className="absolute inset-0 rounded-full bg-primary/20 animate-splash-glow" />

    {/* Main icon container */}
    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-sm border border-primary/20 flex items-center justify-center">
      {/* OpNotes Logo */}
      <img
        src={opnotesLogo}
        alt="OpNotes"
        className="w-20 h-20 drop-shadow-[0_0_12px_var(--primary)]"
      />
    </div>

    {/* Rotating accent ring */}
    <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 160 160">
      <circle
        cx="80"
        cy="80"
        r="76"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="8 16"
        className="text-primary/30"
      />
    </svg>
  </div>
)

// Error icon
const ErrorIcon = () => (
  <div className="relative w-40 h-40 animate-splash-icon">
    <div className="absolute inset-0 rounded-full bg-destructive/20" />
    <div className="absolute inset-3 rounded-full bg-gradient-to-br from-destructive/20 to-transparent backdrop-blur-sm border border-destructive/20 flex items-center justify-center">
      <AlertCircle className="w-20 h-20 text-destructive drop-shadow-[0_0_12px_var(--destructive)]" />
    </div>
  </div>
)

const SplashScreen = ({ error }: { error?: string }) => {
  const { data: appVersion, isLoading: isLoadingAppVersion } = useQuery({
    ...queries.app.version
  })
  const hasError = !!error

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      {/* Background layers */}

      {/* Main center glow */}
      <div
        className="absolute inset-0"
        style={{
          background: hasError
            ? 'radial-gradient(ellipse 80% 50% at 50% 50%, var(--destructive) 0%, transparent 50%)'
            : 'radial-gradient(ellipse 80% 50% at 50% 50%, var(--primary) 0%, transparent 50%)',
          opacity: 0.15
        }}
      />

      {/* Floating orbs - creates depth and atmosphere */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-float"
        style={{
          background: hasError
            ? 'radial-gradient(circle, var(--destructive) 0%, transparent 70%)'
            : 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          top: '10%',
          left: '10%',
          opacity: 0.08,
          filter: 'blur(60px)'
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full animate-float"
        style={{
          background: hasError
            ? 'radial-gradient(circle, var(--destructive) 0%, transparent 70%)'
            : 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          bottom: '5%',
          right: '5%',
          opacity: 0.1,
          filter: 'blur(50px)',
          animationDelay: '-2s'
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full animate-float"
        style={{
          background: 'radial-gradient(circle, var(--foreground) 0%, transparent 70%)',
          top: '20%',
          right: '15%',
          opacity: 0.03,
          filter: 'blur(40px)',
          animationDelay: '-4s'
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, var(--background) 100%)',
          opacity: 0.6
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        {hasError ? <ErrorIcon /> : <SplashIcon />}

        {/* App Name */}
        <h1 className="mt-8 text-5xl font-bold tracking-tight animate-splash-title">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Op Notes
          </span>
        </h1>

        {/* Version badge */}
        {!isLoadingAppVersion && appVersion && (
          <div className="mt-2 animate-splash-subtitle">
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              v{appVersion}
            </span>
          </div>
        )}

        {/* Tagline */}
        <p className="mt-3 text-sm text-muted-foreground animate-splash-subtitle">
          Surgical Notes Management System
        </p>

        {/* Progress or Error */}
        <div className="mt-10 w-64">
          {!hasError ? (
            <>
              {/* Progress bar container */}
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden animate-splash-progress">
                <div
                  className="h-full w-1/2 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-progress-bar"
                />
              </div>

              {/* Status text */}
              <p className="mt-4 text-sm text-center text-muted-foreground animate-splash-status">
                Initializing application...
              </p>
            </>
          ) : (
            <div className="animate-splash-progress">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive text-center">
                  Failed to start application
                </p>
                <p className="mt-1 text-xs text-destructive/80 text-center">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-1.5 animate-splash-footer">
        <span className="text-xs text-muted-foreground">Powered by</span>
        <a
          href="https://wavezync.com"
          target="_blank"
          rel="noreferrer"
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <img src={wavezyncLogoDark} alt="WaveZync" className="h-5" />
        </a>
      </div>
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
