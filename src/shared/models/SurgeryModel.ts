import { Surgery } from '../types/db'
import { PatientModel } from './PatientModel'

export class SurgeryModel implements Surgery {
  id: number
  created_at: Date
  updated_at: Date
  title: string
  bht: string
  ward: string
  date: Date
  notes: string | null
  post_op_notes: string | null
  patient_id: number

  patient?: PatientModel

  constructor(data: Surgery) {
    this.id = data.id
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
    this.title = data.title
    this.bht = data.bht
    this.ward = data.ward
    this.date = new Date(data.date)
    this.notes = data.notes
    this.post_op_notes = data.post_op_notes
    this.patient_id = data.patient_id
  }
}
