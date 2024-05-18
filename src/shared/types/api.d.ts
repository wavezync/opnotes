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
