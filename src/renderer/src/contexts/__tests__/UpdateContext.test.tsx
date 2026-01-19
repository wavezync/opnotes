import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import React from 'react'
import { UpdateProvider, useUpdate } from '../UpdateContext'

// Mock window.electronApi
const mockElectronApi = {
  onUpdateStatus: vi.fn(),
  checkForUpdates: vi.fn(),
  downloadUpdate: vi.fn(),
  quitAndInstall: vi.fn()
}

Object.defineProperty(window, 'electronApi', {
  value: mockElectronApi,
  writable: true
})

// Test component that uses the update context
function TestComponent() {
  const {
    status,
    updateInfo,
    progress,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    dismissError
  } = useUpdate()

  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="version">{updateInfo?.version || 'No version'}</div>
      <div data-testid="progress">{progress?.percent ?? 'No progress'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button data-testid="check" onClick={checkForUpdates}>
        Check
      </button>
      <button data-testid="download" onClick={downloadUpdate}>
        Download
      </button>
      <button data-testid="install" onClick={installUpdate}>
        Install
      </button>
      <button data-testid="dismiss" onClick={dismissError}>
        Dismiss
      </button>
    </div>
  )
}

describe('UpdateContext', () => {
  let statusCallback: ((payload: unknown) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Capture the status callback
    mockElectronApi.onUpdateStatus.mockImplementation((callback) => {
      statusCallback = callback
      return () => {
        statusCallback = null
      }
    })

    mockElectronApi.checkForUpdates.mockResolvedValue(undefined)
    mockElectronApi.downloadUpdate.mockResolvedValue(undefined)
    mockElectronApi.quitAndInstall.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    statusCallback = null
  })

  it('should start with idle status', () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    expect(screen.getByTestId('status')).toHaveTextContent('idle')
  })

  it('should register update status listener on mount', () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    expect(mockElectronApi.onUpdateStatus).toHaveBeenCalled()
  })

  it('should call checkForUpdates API', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('check'))
    })

    expect(mockElectronApi.checkForUpdates).toHaveBeenCalled()
  })

  it('should update status when checking for updates', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('check'))
    })

    await act(async () => {
      statusCallback?.({ status: 'checking' })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('checking')
  })

  it('should show update available with version info', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({
        status: 'available',
        updateInfo: {
          version: '2.0.0',
          releaseName: 'New Release'
        }
      })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('available')
    expect(screen.getByTestId('version')).toHaveTextContent('2.0.0')
  })

  it('should call downloadUpdate API', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('download'))
    })

    expect(mockElectronApi.downloadUpdate).toHaveBeenCalled()
  })

  it('should show download progress', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({
        status: 'downloading',
        progress: {
          percent: 50,
          bytesPerSecond: 1000000,
          transferred: 5000000,
          total: 10000000
        }
      })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('downloading')
    expect(screen.getByTestId('progress')).toHaveTextContent('50')
  })

  it('should show ready status when download complete', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({ status: 'ready' })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('ready')
  })

  it('should call quitAndInstall API', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('install'))
    })

    expect(mockElectronApi.quitAndInstall).toHaveBeenCalled()
  })

  it('should handle error status', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({
        status: 'error',
        error: 'Update failed'
      })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('error')
    expect(screen.getByTestId('error')).toHaveTextContent('Update failed')
  })

  it('should dismiss error', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({
        status: 'error',
        error: 'Update failed'
      })
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Update failed')

    await act(async () => {
      fireEvent.click(screen.getByTestId('dismiss'))
    })

    expect(screen.getByTestId('status')).toHaveTextContent('idle')
    expect(screen.getByTestId('error')).toHaveTextContent('No error')
  })

  it('should auto-dismiss not-available status after timeout', async () => {
    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      statusCallback?.({ status: 'not-available' })
    })

    expect(screen.getByTestId('status')).toHaveTextContent('not-available')

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByTestId('status')).toHaveTextContent('idle')
  })

  it('should handle API errors gracefully', async () => {
    // Use real timers for this test since we're dealing with rejected promises
    vi.useRealTimers()

    mockElectronApi.checkForUpdates.mockRejectedValue(new Error('Network error'))

    render(
      <UpdateProvider>
        <TestComponent />
      </UpdateProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('check'))
    })

    // Should handle the error gracefully (set error state)
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error')
    })

    // Restore fake timers for other tests
    vi.useFakeTimers()
  })

  describe('useUpdate hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow()

      consoleSpy.mockRestore()
    })
  })
})
