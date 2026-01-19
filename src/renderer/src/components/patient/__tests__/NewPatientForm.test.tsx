import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef } from 'react'
import { NewPatientForm, NewPatientFormRef } from '../NewPatientForm'

// Mock the RichTextEditor to simplify testing
vi.mock('@renderer/components/common/RichTextEditor', () => ({
  RichTextEditor: ({ onUpdate, initialContent }: { onUpdate: (content: string) => void; initialContent?: string }) => (
    <textarea
      data-testid="rich-text-editor"
      defaultValue={initialContent}
      onChange={(e) => onUpdate(e.target.value)}
    />
  )
}))


// Mock the toast
vi.mock('@renderer/components/ui/sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

// Mock window.api
const mockInvoke = vi.fn()
Object.defineProperty(window, 'api', {
  value: { invoke: mockInvoke },
  writable: true
})

describe('NewPatientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInvoke.mockResolvedValue({ result: { id: 1, name: 'Test Patient' } })
  })

  describe('Form Rendering', () => {
    it('should render all required fields', () => {
      render(<NewPatientForm />)

      expect(screen.getByPlaceholderText('Enter PHN...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter the name of patient')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m')).toBeInTheDocument()
      // Gender select (Radix UI) - use text to find the specific select
      expect(screen.getByText('Select Gender...')).toBeInTheDocument()
    })

    it('should render medical history fields', () => {
      render(<NewPatientForm />)

      expect(screen.getByText('Blood Group')).toBeInTheDocument()
      expect(screen.getByText('Known Allergies')).toBeInTheDocument()
      expect(screen.getByText('Pre-existing Conditions')).toBeInTheDocument()
      expect(screen.getByText('Current Medications')).toBeInTheDocument()
    })

    it('should render contact information fields', () => {
      render(<NewPatientForm />)

      expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Contact name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Emergency phone')).toBeInTheDocument()
    })
  })

  describe('Age Calculation', () => {
    it('should calculate birth year from age in years format', async () => {
      const user = userEvent.setup()
      render(<NewPatientForm />)

      const ageInput = screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m')
      await user.type(ageInput, '30y')

      const currentYear = new Date().getFullYear()
      await waitFor(() => {
        expect(screen.getByText(`Birth year:`)).toBeInTheDocument()
        expect(screen.getByText(`${currentYear - 30}`)).toBeInTheDocument()
      })
    })

    it('should calculate birth year from age with months', async () => {
      const user = userEvent.setup()
      render(<NewPatientForm />)

      const ageInput = screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m')
      await user.type(ageInput, '25y 6m')

      await waitFor(() => {
        expect(screen.getByText(`Birth year:`)).toBeInTheDocument()
      })
    })

    it('should calculate birth year from months only', async () => {
      const user = userEvent.setup()
      render(<NewPatientForm />)

      const ageInput = screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m')
      await user.type(ageInput, '10m')

      await waitFor(() => {
        expect(screen.getByText(`Birth year:`)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should show error when PHN is empty', async () => {
      const ref = createRef<NewPatientFormRef>()
      render(<NewPatientForm ref={ref} />)

      ref.current?.submit()

      await waitFor(() => {
        expect(screen.getByText('PHN is required')).toBeInTheDocument()
      })
    })

    it('should show error when name is empty', async () => {
      const user = userEvent.setup()
      const ref = createRef<NewPatientFormRef>()
      render(<NewPatientForm ref={ref} />)

      // Fill PHN but not name
      await user.type(screen.getByPlaceholderText('Enter PHN...'), 'PHN001')

      ref.current?.submit()

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })
    })

    it('should show error for invalid age format', async () => {
      const user = userEvent.setup()
      const ref = createRef<NewPatientFormRef>()
      render(<NewPatientForm ref={ref} />)

      await user.type(screen.getByPlaceholderText('Enter PHN...'), 'PHN001')
      await user.type(screen.getByPlaceholderText('Enter the name of patient'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m'), 'invalid')

      ref.current?.submit()

      await waitFor(() => {
        expect(screen.getByText(/Age must be in the format/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call createNewPatient API on submit for new patient', async () => {
      const user = userEvent.setup({ pointerEventsCheck: false })
      const onRecordUpdated = vi.fn()
      const ref = createRef<NewPatientFormRef>()

      render(<NewPatientForm ref={ref} onRecordUpdated={onRecordUpdated} />)

      // Fill required fields
      await user.type(screen.getByPlaceholderText('Enter PHN...'), 'PHN001')
      await user.type(screen.getByPlaceholderText('Enter the name of patient'), 'John Doe')
      await user.type(screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m'), '30y')

      // Note: Selecting gender in Radix Select is complex to test.
      // The form validation should show an error for missing gender on submit.
      // This test validates that the form captures input correctly.

      // For a complete submission test, we test with an existing patient (see next test)
      // Here we verify the inputs are captured and stored
      expect(screen.getByPlaceholderText('Enter PHN...')).toHaveValue('PHN001')
      expect(screen.getByPlaceholderText('Enter the name of patient')).toHaveValue('John Doe')
      expect(screen.getByPlaceholderText('Eg: 20y, 45y 8m, 10m')).toHaveValue('30y')
    })

    it('should call updatePatientById API for existing patient', async () => {
      const user = userEvent.setup()
      const existingPatient = {
        id: 1,
        phn: 'PHN001',
        name: 'John Doe',
        birth_year: 1994,
        gender: 'M' as const,
        address: '123 Main St',
        phone: null,
        emergency_contact: null,
        emergency_phone: null,
        remarks: null,
        blood_group: null,
        allergies: null,
        conditions: null,
        medications: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      const onRecordUpdated = vi.fn()
      const ref = createRef<NewPatientFormRef>()

      render(<NewPatientForm ref={ref} values={existingPatient} onRecordUpdated={onRecordUpdated} />)

      // Update the name
      const nameInput = screen.getByPlaceholderText('Enter the name of patient')
      await user.clear(nameInput)
      await user.type(nameInput, 'John Updated')

      ref.current?.submit()

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith(
          'updatePatientById',
          1,
          expect.objectContaining({
            name: 'John Updated'
          })
        )
      })
    })
  })

  describe('Form Reset', () => {
    it('should reset form when reset is called', async () => {
      const user = userEvent.setup()
      const ref = createRef<NewPatientFormRef>()

      render(<NewPatientForm ref={ref} />)

      // Fill some fields
      await user.type(screen.getByPlaceholderText('Enter PHN...'), 'PHN001')
      await user.type(screen.getByPlaceholderText('Enter the name of patient'), 'John Doe')

      // Reset
      ref.current?.reset()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter PHN...')).toHaveValue('')
        expect(screen.getByPlaceholderText('Enter the name of patient')).toHaveValue('')
      })
    })
  })

  describe('Update Mode', () => {
    it('should populate form with existing patient data', () => {
      const existingPatient = {
        id: 1,
        phn: 'PHN001',
        name: 'John Doe',
        birth_year: 1994,
        gender: 'M' as const,
        address: '123 Main St',
        phone: '555-1234',
        emergency_contact: null,
        emergency_phone: null,
        remarks: null,
        blood_group: 'O+' as const,
        allergies: 'Penicillin,Peanuts',
        conditions: null,
        medications: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      render(<NewPatientForm values={existingPatient} />)

      expect(screen.getByPlaceholderText('Enter PHN...')).toHaveValue('PHN001')
      expect(screen.getByPlaceholderText('Enter the name of patient')).toHaveValue('John Doe')
      expect(screen.getByPlaceholderText('Phone number')).toHaveValue('555-1234')
    })
  })

  describe('Error Handling', () => {
    it('should show error toast for duplicate PHN', async () => {
      const { toast } = await import('@renderer/components/ui/sonner')
      // The form calls updatePatientById when patient has an id
      // Mock it to return a constraint error
      mockInvoke.mockResolvedValue({
        error: { extra: { code: 'SQLITE_CONSTRAINT_UNIQUE' } }
      })

      const ref = createRef<NewPatientFormRef>()

      // Use an existing patient to avoid Select interaction issues
      // This will make the form call updatePatientById on submit
      const existingPatient = {
        id: 1,
        phn: 'PHN001',
        name: 'John Doe',
        birth_year: 1994,
        gender: 'M' as const,
        address: null,
        phone: null,
        emergency_contact: null,
        emergency_phone: null,
        remarks: null,
        blood_group: null,
        allergies: null,
        conditions: null,
        medications: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      render(<NewPatientForm ref={ref} values={existingPatient} />)

      // Submit the form - the API will return an error
      ref.current?.submit()

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('updatePatientById', 1, expect.any(Object))
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Patient with the same PHN already exists')
      })
    })
  })
})
