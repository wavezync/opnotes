import { Patient } from '../types/db'
export class PatientModel implements Patient {
  id: number
  phn: string
  name: string
  birth_year: number
  gender: 'M' | 'F'
  address: string | null
  phone: string | null
  emergency_contact: string | null
  emergency_phone: string | null
  remarks: string | null
  created_at: Date
  updated_at: Date
  age: number

  constructor(data: Patient) {
    this.id = data.id
    this.phn = data.phn
    this.name = data.name
    this.birth_year = data.birth_year
    this.gender = data.gender
    this.address = data.address
    this.phone = data.phone
    this.emergency_contact = data.emergency_contact
    this.emergency_phone = data.emergency_phone
    this.remarks = data.remarks
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)

    const now = new Date()
    this.age = now.getFullYear() - this.birth_year
  }
}
