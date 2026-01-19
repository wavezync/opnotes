import { Patient, Doctor, Surgery, SurgeryTemplate, SurgeryFollowup } from '../../src/shared/types/db'

/**
 * Mock patient data for testing
 */
export const mockPatients: Partial<Patient>[] = [
  {
    id: 1,
    bht: 'BHT001',
    name: 'John Doe',
    age: 45,
    sex: 'Male',
    ward: 'Ward A',
    date_of_admission: '2024-01-15',
    date_of_discharge: null,
    diagnosis: 'Appendicitis',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-15T10:00:00.000Z',
    blood_group: 'O+',
    phone: '123-456-7890',
    allergies: 'Penicillin',
    chronic_conditions: null,
    current_medications: null,
    previous_surgeries: null
  },
  {
    id: 2,
    bht: 'BHT002',
    name: 'Jane Smith',
    age: 32,
    sex: 'Female',
    ward: 'Ward B',
    date_of_admission: '2024-01-16',
    date_of_discharge: '2024-01-20',
    diagnosis: 'Cholecystitis',
    created_at: '2024-01-16T09:00:00.000Z',
    updated_at: '2024-01-20T15:00:00.000Z',
    blood_group: 'A+',
    phone: '987-654-3210',
    allergies: null,
    chronic_conditions: 'Diabetes',
    current_medications: 'Metformin',
    previous_surgeries: null
  },
  {
    id: 3,
    bht: 'BHT003',
    name: 'Bob Johnson',
    age: 58,
    sex: 'Male',
    ward: 'Ward A',
    date_of_admission: '2024-01-17',
    date_of_discharge: null,
    diagnosis: 'Hernia',
    created_at: '2024-01-17T11:00:00.000Z',
    updated_at: '2024-01-17T11:00:00.000Z',
    blood_group: 'B-',
    phone: null,
    allergies: null,
    chronic_conditions: 'Hypertension',
    current_medications: 'Lisinopril',
    previous_surgeries: 'Appendectomy (2015)'
  }
]

/**
 * Mock doctor data for testing
 */
export const mockDoctors: Partial<Doctor>[] = [
  {
    id: 1,
    name: 'Dr. Sarah Wilson',
    designation: 'Senior Consultant',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Dr. Michael Brown',
    designation: 'Consultant',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'Dr. Emily Chen',
    designation: 'Registrar',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

/**
 * Mock surgery data for testing
 */
export const mockSurgeries: Partial<Surgery>[] = [
  {
    id: 1,
    patient_id: 1,
    date: '2024-01-16',
    procedure: 'Appendectomy',
    indication: 'Acute appendicitis',
    findings: 'Inflamed appendix with localized peritonitis',
    procedure_details: 'Laparoscopic appendectomy performed',
    outcome: 'Successful',
    created_at: '2024-01-16T14:00:00.000Z',
    updated_at: '2024-01-16T14:00:00.000Z'
  },
  {
    id: 2,
    patient_id: 2,
    date: '2024-01-18',
    procedure: 'Cholecystectomy',
    indication: 'Symptomatic gallstones',
    findings: 'Multiple gallstones, chronic inflammation',
    procedure_details: 'Laparoscopic cholecystectomy completed',
    outcome: 'Successful',
    created_at: '2024-01-18T10:00:00.000Z',
    updated_at: '2024-01-18T10:00:00.000Z'
  }
]

/**
 * Mock surgery template data for testing
 */
export const mockSurgeryTemplates: Partial<SurgeryTemplate>[] = [
  {
    id: 1,
    name: 'Appendectomy Template',
    description: 'Standard template for appendectomy procedures',
    content: '<p>Standard appendectomy procedure template</p>',
    category: 'General Surgery',
    tags: 'appendix,laparoscopic',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Cholecystectomy Template',
    description: 'Standard template for cholecystectomy',
    content: '<p>Standard cholecystectomy procedure template</p>',
    category: 'General Surgery',
    tags: 'gallbladder,laparoscopic',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

/**
 * Mock surgery followup data for testing
 */
export const mockFollowups: Partial<SurgeryFollowup>[] = [
  {
    id: 1,
    surgery_id: 1,
    date: '2024-01-23',
    notes: 'Patient recovering well, wounds healing',
    created_at: '2024-01-23T09:00:00.000Z',
    updated_at: '2024-01-23T09:00:00.000Z'
  },
  {
    id: 2,
    surgery_id: 1,
    date: '2024-01-30',
    notes: 'Sutures removed, full recovery expected',
    created_at: '2024-01-30T09:00:00.000Z',
    updated_at: '2024-01-30T09:00:00.000Z'
  }
]

/**
 * Creates a new mock patient with optional overrides
 */
export function createMockPatient(overrides: Partial<Patient> = {}): Partial<Patient> {
  return {
    bht: `BHT${Date.now()}`,
    name: 'Test Patient',
    age: 30,
    sex: 'Male',
    ward: 'Ward A',
    date_of_admission: new Date().toISOString().split('T')[0],
    diagnosis: 'Test Diagnosis',
    ...overrides
  }
}

/**
 * Creates a new mock doctor with optional overrides
 */
export function createMockDoctor(overrides: Partial<Doctor> = {}): Partial<Doctor> {
  return {
    name: 'Dr. Test Doctor',
    designation: 'Consultant',
    ...overrides
  }
}

/**
 * Creates a new mock surgery with optional overrides
 */
export function createMockSurgery(
  patientId: number,
  overrides: Partial<Surgery> = {}
): Partial<Surgery> {
  return {
    patient_id: patientId,
    date: new Date().toISOString().split('T')[0],
    procedure: 'Test Procedure',
    indication: 'Test Indication',
    findings: 'Test Findings',
    procedure_details: 'Test Details',
    outcome: 'Successful',
    ...overrides
  }
}

/**
 * Creates a new mock surgery template with optional overrides
 */
export function createMockTemplate(overrides: Partial<SurgeryTemplate> = {}): Partial<SurgeryTemplate> {
  return {
    name: 'Test Template',
    description: 'Test Description',
    content: '<p>Test Content</p>',
    category: 'Test Category',
    tags: 'test,template',
    ...overrides
  }
}
