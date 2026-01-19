import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

/**
 * Creates a QueryClient configured for testing
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0
      },
      mutations: {
        retry: false
      }
    }
  })
}

interface WrapperProps {
  children: ReactNode
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialEntries?: string[]
  withRouter?: boolean
}

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    withRouter = true,
    ...renderOptions
  } = options

  function Wrapper({ children }: WrapperProps): ReactElement {
    const content = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

    if (withRouter) {
      return <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>
    }

    return content
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })

  return {
    ...result,
    queryClient
  }
}

/**
 * Waits for all React Query queries to settle
 */
export async function waitForQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.cancelQueries()
}

/**
 * Creates a mock function that resolves with the given value
 */
export function mockResolve<T>(value: T): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue(value)
}

/**
 * Creates a mock function that rejects with the given error
 */
export function mockReject(error: Error | string): ReturnType<typeof vi.fn> {
  const err = typeof error === 'string' ? new Error(error) : error
  return vi.fn().mockRejectedValue(err)
}

/**
 * Helper to get the mock window.api
 */
export function getMockApi(): { invoke: ReturnType<typeof vi.fn> } {
  return window.api as { invoke: ReturnType<typeof vi.fn> }
}

/**
 * Helper to setup mock API response for a specific method
 */
export function mockApiResponse(method: string, response: unknown): void {
  const api = getMockApi()
  api.invoke.mockImplementation((m: string) => {
    if (m === method) {
      return Promise.resolve(response)
    }
    return Promise.resolve({ result: undefined })
  })
}
