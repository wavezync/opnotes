import { Doctor } from '../types/db'

export class DoctorModel implements Doctor {
  id: number
  name: string
  designation: string | null
  slmc_reg_no: string | null
  created_at: Date
  updated_at: Date

  constructor(data: Doctor) {
    this.id = data.id
    this.name = data.name
    this.designation = data.designation
    this.slmc_reg_no = data.slmc_reg_no
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
  }
}
