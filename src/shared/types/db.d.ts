import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface PatientTable {
  id: Generated<number>
  phn: string
  name: string
  birth_year: number
  gender: 'M' | 'F'

  created_at: ColumnType<Date, string, never>
  updated_at: ColumnType<Date, string, string>
}

export interface SurgeryTable {
  id: Generated<number>
  title: string
  bht: string
  ward: string
  date: ColumnType<Date, number, never>
  notes: string | null
  post_op_notes: string | null

  created_at: ColumnType<Date, number, never>
  updated_at: ColumnType<Date, number, number>

  patient_id: number
}

export interface DoctorsTable {
  id: Generated<number>
  name: string
  designation: string | null
  slmc_reg_no: string | null

  created_at: ColumnType<Date, number, never>
  updated_at: ColumnType<Date, number, number>
}

export interface SurgeryDoctorsDoneByTable {
  surgery_id: number
  doctor_id: number
}

export interface SurgeryDoctorsAssistedByTable {
  surgery_id: number
  doctor_id: number
}

export interface SurgeryFollowUpTable {
  id: Generated<number>
  notes: string
  surgery_id: number

  created_at: ColumnType<Date, number, never>
  updated_at: ColumnType<Date, number, number>
}

export interface Database {
  patients: PatientTable
  surgeries: SurgeryTable
  doctors: DoctorsTable
  surgery_doctor_done_by: SurgeryDoctorsDoneByTable
  surgery_doctor_assisted_by: SurgeryDoctorsAssistedByTable
  surgery_follow_ups: SurgeryFollowUpTable
}

export type Patient = Selectable<PatientTable>
export type NewPatient = Insertable<PatientTable>
export type PatientUpdate = Updateable<PatientTable>

export type Surgery = Selectable<SurgeryTable>
export type NewSurgery = Insertable<SurgeryTable>
export type SurgeryUpdate = Updateable<SurgeryTable>

export type Doctor = Selectable<DoctorsTable>
export type NewDoctor = Insertable<DoctorsTable>
export type DoctorUpdate = Updateable<DoctorsTable>