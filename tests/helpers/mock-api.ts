import { vi } from 'vitest'

export type MockApiFunction = ReturnType<typeof vi.fn>

/**
 * Creates a mock window.api for renderer tests
 */
export function createMockApi(): { invoke: MockApiFunction } {
  return {
    invoke: vi.fn()
  }
}

/**
 * Sets up mock API responses for common operations
 */
export function setupMockApiResponses(
  mockApi: { invoke: MockApiFunction },
  responses: Record<string, unknown>
): void {
  mockApi.invoke.mockImplementation((method: string, ...args: unknown[]) => {
    const response = responses[method]
    if (typeof response === 'function') {
      return response(...args)
    }
    return response ?? { result: undefined }
  })
}

/**
 * Common mock responses for settings
 */
export const mockSettingsResponses = {
  getAppSettings: {
    result: {
      hospital_name: 'Test Hospital',
      unit_name: 'Test Unit',
      telephone: '123-456-7890',
      theme: 'light',
      onboarding_completed: 1,
      backup_path: '/tmp/backups',
      backup_count: 5,
      backup_frequency: 'daily'
    }
  },
  updateAppSettings: { result: true }
}

/**
 * Common mock responses for patients
 */
export const mockPatientResponses = {
  getPatients: {
    result: {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    }
  },
  getPatient: { result: null },
  createPatient: { result: { id: 1 } },
  updatePatient: { result: true },
  deletePatient: { result: true }
}

/**
 * Common mock responses for doctors
 */
export const mockDoctorResponses = {
  getDoctors: {
    result: {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    }
  },
  getDoctor: { result: null },
  createDoctor: { result: { id: 1 } },
  updateDoctor: { result: true },
  deleteDoctor: { result: true }
}

/**
 * Common mock responses for surgeries
 */
export const mockSurgeryResponses = {
  getSurgeries: {
    result: {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    }
  },
  getSurgery: { result: null },
  createSurgery: { result: { id: 1 } },
  updateSurgery: { result: true },
  deleteSurgery: { result: true }
}
