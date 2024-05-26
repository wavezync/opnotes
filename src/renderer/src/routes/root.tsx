import { NavLink, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { cn } from '@renderer/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import hero from '../assets/hero.svg?asset'

import { Loader2Icon, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { SettingsProvider, useSettings } from '@renderer/contexts/SettingsContext'
import { PoweredBy } from '@renderer/components/brand/PowredBy'

const NavLinkComponent = ({
  to,
  children,
  className
}: {
  to: string
  children: React.ReactNode
  className?: string
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        cn(
          'text-secondary-foreground text-sm underline-offset-4 hover:underline cursor-pointer hover:bg-accent/80 p-2 rounded-lg',
          (isActive || isPending) && 'bg-accent',
          className
        )
      }
    >
      {children}
    </NavLink>
  )
}

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

const Providers = ({ children }) => {
  return <SettingsProvider>{children}</SettingsProvider>
}

const MainLayout = () => {
  const { appVersion } = useSettings()

  return (
    <>
      <nav className="flex w-full space-x-2 text-2xl justify-start items-center p-1 text-left m-1 border-b-2">
        <NavLinkComponent to="/">Home</NavLinkComponent>
        <NavLinkComponent to="/patients">Patients</NavLinkComponent>
        <NavLinkComponent to="/surgeries">Surgeries</NavLinkComponent>
        <NavLinkComponent to="/doctors">Doctors</NavLinkComponent>

        <div className="flex-1"></div>
        {appVersion && <div className="text-xs text-secondary-foreground">v{appVersion}</div>}

        <NavLinkComponent to="/settings" className="!mr-1">
          <Settings className="w-4 h-4" />
        </NavLinkComponent>
      </nav>
      <div className="grow m-1 p-3 overflow-y-auto">
        <Outlet />
      </div>
    </>
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
      <main className="h-screen w-full flex flex-col antialiased bg-background overflow-hidden">
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
