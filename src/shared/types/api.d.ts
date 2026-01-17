export interface PatientFilter {
  search?: string

  pageSize?: number
  page?: number
}

export interface SurgeryFilter {
  search?: string
  ward?: string
  start_date?: Date
  end_date?: Date
  patient_id?: number

  pageSize?: number
  page?: number
}

export interface DoctorFilter {
  search?: string

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
