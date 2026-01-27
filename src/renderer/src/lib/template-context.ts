import { TemplateContext, TemplateType } from '../../../shared/types/template-blocks'

// Sample data for template preview
export const getSampleContext = (type: TemplateType): TemplateContext => {
  const baseContext: TemplateContext = {
    patient: {
      name: 'John Doe',
      age: 45,
      gender: 'M',
      age_gender: '45 / M',
      phn: 'PHN-2024-12345',
      address: '123 Main Street, Colombo 07',
      phone: '+94 71 234 5678',
      blood_group: 'O+',
      allergies: 'Penicillin, Latex',
      conditions: 'Diabetes Type 2, Hypertension',
      medications: 'Metformin 500mg, Lisinopril 10mg',
      emergency_contact: 'Jane Doe',
      emergency_phone: '+94 77 987 6543',
      remarks: 'Previous surgeries: Appendectomy (2018)'
    },
    surgery: {
      title: 'Laparoscopic Cholecystectomy',
      bht: 'BHT-2024-00123',
      ward: 'Ward 5A',
      date: '2024-01-15',
      doa: '2024-01-14',
      dod: '2024-01-17',
      notes: `<p>The patient was placed in supine position under general anesthesia. Standard laparoscopic ports were placed. The gallbladder was identified and dissected from the liver bed using electrocautery.</p>
<p>The cystic duct and artery were identified, clipped, and divided. The gallbladder was removed through the umbilical port.</p>
<p><strong>Findings:</strong></p>
<ul>
<li>Multiple small gallstones</li>
<li>Mild chronic cholecystitis</li>
<li>No bile duct stones</li>
</ul>
<p>Estimated blood loss: 20ml. No complications.</p>`,
      inward_management: `<p><strong>IV Medications:</strong></p>
<ul>
<li>IV Ceftriaxone 1g BD</li>
<li>IV Metronidazole 500mg TDS</li>
<li>IV Paracetamol 1g QID PRN</li>
<li>IV Normal Saline 1L over 8 hours</li>
</ul>`,
      post_op_notes: `<p><strong>Post-operative instructions:</strong></p>
<ul>
<li>Clear fluids for 6 hours, then progress to regular diet as tolerated</li>
<li>Pain management with paracetamol PRN</li>
<li>Ambulation encouraged</li>
<li>Wound care: Keep dry for 48 hours</li>
</ul>
<p>Follow-up in 2 weeks.</p>`,
      discharge_plan: `<p><strong>Discharge Instructions:</strong></p>
<ul>
<li>Resume normal diet</li>
<li>Paracetamol 1g QID PRN for pain</li>
<li>Avoid heavy lifting for 2 weeks</li>
<li>Return to work in 1 week</li>
</ul>
<p>Review appointment: 2024-01-29</p>`,
      referral: null,
      doneByAsString: 'Dr. Sarah Smith (Consultant Surgeon), Dr. Michael Jones (Senior Registrar)',
      assistedByAsString: 'Dr. Emily Brown (Registrar)',
      doneBy: [
        { name: 'Dr. Sarah Smith', designation: 'Consultant Surgeon' },
        { name: 'Dr. Michael Jones', designation: 'Senior Registrar' }
      ],
      assistedBy: [{ name: 'Dr. Emily Brown', designation: 'Registrar' }]
    },
    settings: {
      hospital: 'General Hospital Colombo',
      subtitle: 'Teaching Hospital',
      unit: 'Surgical Unit A',
      telephone: '+94 11 234 5678'
    }
  }

  // Add followup data for followup templates
  if (type === 'followup') {
    baseContext.followup = {
      date: '2024-01-29',
      notes: `<p>Patient recovering well. Wound healing without complications.</p>
<p><strong>Examination:</strong></p>
<ul>
<li>Port sites clean and dry</li>
<li>No signs of infection</li>
<li>Abdomen soft, non-tender</li>
</ul>
<p><strong>Plan:</strong></p>
<ul>
<li>Continue current medications</li>
<li>Resume normal activities</li>
<li>Review in 4 weeks if needed</li>
</ul>`
    }
  }

  return baseContext
}

// Helper to create context from actual data
export interface CreateContextParams {
  patient: {
    name: string
    birth_year: number
    gender: 'M' | 'F'
    phn: string
    address?: string | null
    phone?: string | null
    blood_group?: string | null
    allergies?: string | null
    conditions?: string | null
    medications?: string | null
    emergency_contact?: string | null
    emergency_phone?: string | null
    remarks?: string | null
  }
  surgery: {
    title: string
    bht: string
    ward: string
    date?: Date | null
    doa?: Date | null
    dod?: Date | null
    notes?: string | null
    inward_management?: string | null
    post_op_notes?: string | null
    discharge_plan?: string | null
    referral?: string | null
    doneBy?: Array<{ name: string; designation: string | null }>
    assistedBy?: Array<{ name: string; designation: string | null }>
  }
  followup?: {
    created_at: Date
    notes: string
  }
  settings: {
    hospital?: string
    subtitle?: string
    unit?: string
    telephone?: string | null
  }
}

// Format date to string
const formatDate = (date: Date | null | undefined): string | null => {
  if (!date) return null
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Calculate age from birth year
const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear
}

// Format doctors list to string
const formatDoctorsToString = (
  doctors: Array<{ name: string; designation: string | null }> | undefined
): string => {
  if (!doctors || doctors.length === 0) return ''
  return doctors
    .map((d) => (d.designation ? `${d.name} (${d.designation})` : d.name))
    .join(', ')
}

export const createTemplateContext = (params: CreateContextParams): TemplateContext => {
  const age = calculateAge(params.patient.birth_year)
  const ageGender = `${age} / ${params.patient.gender}`

  return {
    patient: {
      name: params.patient.name,
      age,
      gender: params.patient.gender,
      age_gender: ageGender,
      phn: params.patient.phn,
      address: params.patient.address || null,
      phone: params.patient.phone || null,
      blood_group: params.patient.blood_group || null,
      allergies: params.patient.allergies || null,
      conditions: params.patient.conditions || null,
      medications: params.patient.medications || null,
      emergency_contact: params.patient.emergency_contact || null,
      emergency_phone: params.patient.emergency_phone || null,
      remarks: params.patient.remarks || null
    },
    surgery: {
      title: params.surgery.title,
      bht: params.surgery.bht,
      ward: params.surgery.ward,
      date: formatDate(params.surgery.date),
      doa: formatDate(params.surgery.doa),
      dod: formatDate(params.surgery.dod),
      notes: params.surgery.notes || null,
      inward_management: params.surgery.inward_management || null,
      post_op_notes: params.surgery.post_op_notes || null,
      discharge_plan: params.surgery.discharge_plan || null,
      referral: params.surgery.referral || null,
      doneBy: params.surgery.doneBy || [],
      assistedBy: params.surgery.assistedBy || [],
      doneByAsString: formatDoctorsToString(params.surgery.doneBy),
      assistedByAsString: formatDoctorsToString(params.surgery.assistedBy)
    },
    followup: params.followup
      ? {
          date: formatDate(params.followup.created_at),
          notes: params.followup.notes
        }
      : undefined,
    settings: {
      hospital: params.settings.hospital || 'Hospital Name',
      subtitle: params.settings.subtitle || '',
      unit: params.settings.unit || 'Unit Name',
      telephone: params.settings.telephone || null
    }
  }
}
