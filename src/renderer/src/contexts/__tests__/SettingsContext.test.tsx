import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SettingsProvider, useSettings } from '../SettingsContext'

// Mock the API
vi.mock('@renderer/lib/queries', () => ({
  queries: {
    app: {
      settings: {
        queryKey: ['app', 'settings'],
        queryFn: vi.fn()
      },
      version: {
        queryKey: ['app', 'version'],
        queryFn: vi.fn()
      }
    }
  }
}))

// Test component that uses the settings context
function TestComponent() {
  const { settings, appVersion } = useSettings()

  return (
    <div>
      <div data-testid="hospital">{settings.hospital_name || 'No hospital'}</div>
      <div data-testid="theme">{settings.theme || 'No theme'}</div>
      <div data-testid="version">{appVersion || 'No version'}</div>
    </div>
  )
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })
}

describe('SettingsContext', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should provide empty settings while loading', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </QueryClientProvider>
    )

    // While loading, should show empty/default values
    expect(screen.getByTestId('hospital')).toHaveTextContent('No hospital')
  })

  it('should provide settings after loading', async () => {
    // Pre-populate the query cache with unwrapped data (after unwrapResult)
    queryClient.setQueryData(['app', 'settings'], [
      { key: 'hospital_name', value: 'Test Hospital' },
      { key: 'theme', value: 'dark' },
      { key: 'unit_name', value: 'Surgery Unit' }
    ])

    queryClient.setQueryData(['app', 'version'], '1.0.0')

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('hospital')).toHaveTextContent('Test Hospital')
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('version')).toHaveTextContent('1.0.0')
  })

  it('should handle null setting values', async () => {
    queryClient.setQueryData(['app', 'settings'], [
      { key: 'hospital_name', value: null },
      { key: 'theme', value: 'light' }
    ])

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })

    // Null values should still be accessible
    expect(screen.getByTestId('hospital')).toHaveTextContent('No hospital')
  })

  it('should use default context values when used outside provider', () => {
    // The context has default values, so it won't throw
    // Instead it will use the default (empty settings)
    render(<TestComponent />)

    // Should render with empty/default values
    expect(screen.getByTestId('hospital')).toHaveTextContent('No hospital')
    expect(screen.getByTestId('theme')).toHaveTextContent('No theme')
    expect(screen.getByTestId('version')).toHaveTextContent('No version')
  })
})
