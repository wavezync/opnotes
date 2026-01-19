import { Surgery } from '../types/db'
import { DoctorModel } from './DoctorModel'
import { PatientModel } from './PatientModel'

const toValidDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = new Date(value as number)
  return isNaN(date.getTime()) ? null : date
}

export class SurgeryModel implements Surgery {
  id: number
  created_at: Date
  updated_at: Date
  title: string
  bht: string
  ward: string
  date: Date | null
  doa: Date | null
  dod: Date | null
  notes: string | null
  inward_management: string | null
  post_op_notes: string | null
  referral: string | null
  patient_id: number

  patient?: PatientModel
  doneBy?: DoctorModel[]
  assistedBy?: DoctorModel[]

  constructor(data: Surgery) {
    this.id = data.id
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
    this.title = data.title
    this.bht = data.bht
    this.ward = data.ward
    this.date = toValidDate(data.date)
    this.doa = toValidDate(data.doa)
    this.dod = toValidDate(data.dod)
    this.notes = data.notes
    this.inward_management = data.inward_management
    this.post_op_notes = data.post_op_notes
    this.referral = data.referral
    this.patient_id = data.patient_id
  }
}
