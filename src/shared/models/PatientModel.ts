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
  blood_group: string | null
  allergies: string | null
  conditions: string | null
  medications: string | null
  created_at: Date
  updated_at: Date
  age: number
  ward?: string

  constructor(data: Patient & { ward?: string }) {
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
    this.blood_group = data.blood_group
    this.allergies = data.allergies
    this.conditions = data.conditions
    this.medications = data.medications
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
    this.ward = data.ward

    const now = new Date()
    this.age = now.getFullYear() - this.birth_year
  }
}
