import '@testing-library/jest-dom/vitest'
import { vi, beforeEach } from 'vitest'

// Mock window.api for renderer tests
const mockApi = {
  invoke: vi.fn()
}

Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.ResizeObserver = MockResizeObserver

// Mock IntersectionObserver
class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock scrollTo
window.scrollTo = vi.fn()
Element.prototype.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  mockApi.invoke.mockReset()
})
