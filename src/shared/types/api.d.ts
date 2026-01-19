export interface PatientFilter {
  search?: string
  sortBy?: 'name' | 'phn' | 'age' | 'updated_at' | 'created_at'
  sortOrder?: 'asc' | 'desc'

  pageSize?: number
  page?: number
}

export interface SurgeryFilter {
  search?: string
  ward?: string
  start_date?: Date
  end_date?: Date
  patient_id?: number
  sortBy?: 'title' | 'bht' | 'date' | 'ward' | 'updated_at' | 'created_at'
  sortOrder?: 'asc' | 'desc'

  pageSize?: number
  page?: number
}

export interface DoctorFilter {
  search?: string
  sortBy?: 'name' | 'designation' | 'updated_at' | 'created_at'
  sortOrder?: 'asc' | 'desc'

  pageSize?: number
  page?: number
}

export interface SurgeryTemplateFilter {
  search?: string // FTS search query
  category?: string // Filter by category
  doctorId?: number | null // Filter by doctor (null = global only)
  includeGlobal?: boolean // Include global templates when doctorId is set

  pageSize?: number
  page?: number
}

export interface ActivityLogFilter {
  entityType?: 'patient' | 'surgery' | 'followup' | 'doctor'
  action?: 'created' | 'updated' | 'deleted'
  search?: string
  startDate?: number
  endDate?: number
  pageSize?: number
  page?: number
}

export interface DoctorSurgeryFilter extends SurgeryFilter {
  role?: 'done_by' | 'assisted_by' | 'all'
}

// Re-export from template-blocks for convenience
export type { PrintTemplateFilter, TemplateType } from './template-blocks'
