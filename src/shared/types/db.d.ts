import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface PatientTable {
  id: Generated<number>
  phn: string
  name: string
  birth_year: number
  gender: 'M' | 'F'
  address: string | null
  phone: string | null
  emergency_contact: string | null
  emergency_phone: string | null
  remarks: string | null

  created_at: ColumnType<Date, number, never>
  updated_at: ColumnType<Date, number, number>
}

export interface SurgeryTable {
  id: Generated<number>
  title: string
  bht: string
  ward: string
  date: ColumnType<Date, number, number> | null
  doa: ColumnType<Date, number, number> | null
  dod: ColumnType<Date, number, number> | null
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

export interface PatientsFTS {
  patient_id: number
  name: string
  phn: string
}

export interface SurgeriesFTS {
  patient_id: number
  surgery_id: number
  title: string
  bht: string
}

export interface DoctorsFTS {
  doctor_id: number
  name: string
  slmc_reg_no: string
}

export interface AppSettingsTable {
  id: Generated<number>
  key: string
  value: string | null
  display_name: string
}

export interface SurgeryTemplateTable {
  id: Generated<number>
  title: string
  content: string
  category: string
  tags: string | null // JSON array stored as string, e.g. '["laparoscopic", "emergency"]'
  doctor_id: number | null
  created_at: ColumnType<Date, number, never>
  updated_at: ColumnType<Date, number, number>
}

export interface SurgeryTemplatesFTS {
  template_id: number
  title: string
  category: string
  tags: string
  content: string
}

export interface Database {
  patients: PatientTable
  surgeries: SurgeryTable
  doctors: DoctorsTable
  surgery_doctors_done_by: SurgeryDoctorsDoneByTable
  surgery_doctors_assisted_by: SurgeryDoctorsAssistedByTable
  surgery_followups: SurgeryFollowUpTable
  surgery_templates: SurgeryTemplateTable

  patients_fts: PatientsFTS
  surgeries_fts: SurgeriesFTS
  doctors_fts: DoctorsFTS
  surgery_templates_fts: SurgeryTemplatesFTS

  app_settings: AppSettingsTable
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

export type Followup = Selectable<SurgeryFollowUpTable>
export type NewFollowup = Insertable<SurgeryFollowUpTable>
export type FollowupUpdate = Updateable<SurgeryFollowUpTable>

export type AppSetting = Selectable<AppSettingsTable>
export type NewAppSetting = Insertable<AppSettingsTable>
export type AppSettingUpdate = Updateable<AppSettingsTable>

export type SurgeryTemplate = Selectable<SurgeryTemplateTable>
export type NewSurgeryTemplate = Insertable<SurgeryTemplateTable>
export type SurgeryTemplateUpdate = Updateable<SurgeryTemplateTable>
