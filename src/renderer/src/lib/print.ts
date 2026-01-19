import { PatientModel } from '@shared/models/PatientModel'
import { SurgeryModel } from '@shared/models/SurgeryModel'
import { FollowupModel } from '@shared/models/FollowupModel'
import { formatDate, formatDateTime, isEmptyHtml } from './utils'
import { TemplateStructure, TemplateContext } from '../../../shared/types/template-blocks'

// Legacy print data for Handlebars templates
export const surgeryPrintData = (
  patient?: PatientModel,
  surgery?: SurgeryModel,
  settings?: Record<string, string | null>
) => ({
  template: 'surgery',
  patient: {
    ...patient,
    age: patient?.age ? `${patient?.age} yrs` : `<1 yrs`
  },
  surgery: {
    ...surgery,
    doneBy: surgery?.doneBy
      ? surgery?.doneBy.map((doctor) => `Dr. ${doctor.name} (${doctor.designation})`)
      : [],
    doneByAsString: surgery?.doneBy
      ?.map((doctor) => `Dr. ${doctor.name} (${doctor.designation})`)
      .join(', '),
    assistedBy: surgery?.assistedBy
      ? surgery?.assistedBy.map((doctor) => `Dr. ${doctor.name} (${doctor.designation})`)
      : [],
    assistedByAsString: surgery?.assistedBy
      ?.map((doctor) => `Dr. ${doctor.name} (${doctor.designation})`)
      .join(', '),
    date: surgery?.date ? formatDate(surgery?.date) : null,
    doa: surgery?.doa ? formatDate(surgery?.doa) : null,
    dod: surgery?.dod ? formatDate(surgery?.dod) : null,
    notes: isEmptyHtml(surgery?.notes) ? null : surgery?.notes,
    inward_management: isEmptyHtml(surgery?.inward_management) ? null : surgery?.inward_management,
    post_op_notes: isEmptyHtml(surgery?.post_op_notes) ? null : surgery?.post_op_notes,
    referral: isEmptyHtml(surgery?.referral) ? null : surgery?.referral
  },
  settings: {
    hospital: settings?.hospital || '',
    unit: settings?.unit || '',
    telephone: settings?.telephone || ''
  }
})

// Legacy print data for Handlebars templates
export const followupPrintData = (
  patient?: PatientModel,
  surgery?: SurgeryModel,
  followup?: FollowupModel,
  settings?: Record<string, string | null>
) => ({
  template: 'followup',
  patient: {
    ...patient,
    age: patient?.age ? `${patient?.age} yrs` : `<1 yrs`
  },
  surgery: {
    bht: surgery?.bht || '',
    ward: surgery?.ward || '',
    date: surgery?.date ? formatDate(surgery.date) : null,
    doa: surgery?.doa ? formatDate(surgery.doa) : null,
    dod: surgery?.dod ? formatDate(surgery.dod) : null
  },
  followup: {
    date: followup?.created_at ? formatDateTime(followup.created_at) : '',
    notes: isEmptyHtml(followup?.notes) ? null : followup?.notes
  },
  settings: {
    hospital: settings?.hospital || '',
    unit: settings?.unit || '',
    telephone: settings?.telephone || ''
  }
})

// New template builder context creation
export const createSurgeryContext = (
  patient?: PatientModel,
  surgery?: SurgeryModel,
  settings?: Record<string, string | null>
): TemplateContext => ({
  patient: {
    name: patient?.name || '',
    age: patient?.age || 0,
    gender: patient?.gender || 'M',
    age_gender: `${patient?.age || 0} / ${patient?.gender || 'M'}`,
    phn: patient?.phn || '',
    address: patient?.address || null,
    phone: patient?.phone || null,
    blood_group: patient?.blood_group || null,
    allergies: patient?.allergies || null,
    conditions: patient?.conditions || null,
    medications: patient?.medications || null,
    emergency_contact: patient?.emergency_contact || null,
    emergency_phone: patient?.emergency_phone || null,
    remarks: patient?.remarks || null
  },
  surgery: {
    title: surgery?.title || '',
    bht: surgery?.bht || '',
    ward: surgery?.ward || '',
    date: surgery?.date ? formatDate(surgery.date) : null,
    doa: surgery?.doa ? formatDate(surgery.doa) : null,
    dod: surgery?.dod ? formatDate(surgery.dod) : null,
    notes: isEmptyHtml(surgery?.notes) ? null : surgery?.notes || null,
    inward_management: isEmptyHtml(surgery?.inward_management) ? null : surgery?.inward_management || null,
    post_op_notes: isEmptyHtml(surgery?.post_op_notes) ? null : surgery?.post_op_notes || null,
    referral: isEmptyHtml(surgery?.referral) ? null : surgery?.referral || null,
    doneBy:
      surgery?.doneBy?.map((d) => ({
        name: d.name,
        designation: d.designation
      })) || [],
    assistedBy:
      surgery?.assistedBy?.map((d) => ({
        name: d.name,
        designation: d.designation
      })) || [],
    doneByAsString:
      surgery?.doneBy?.map((d) => (d.designation ? `${d.name} (${d.designation})` : d.name)).join(', ') ||
      '',
    assistedByAsString:
      surgery?.assistedBy?.map((d) => (d.designation ? `${d.name} (${d.designation})` : d.name)).join(', ') ||
      ''
  },
  settings: {
    hospital: settings?.hospital || 'Hospital Name',
    unit: settings?.unit || 'Unit Name',
    telephone: settings?.telephone || null
  }
})

export const createFollowupContext = (
  patient?: PatientModel,
  surgery?: SurgeryModel,
  followup?: FollowupModel,
  settings?: Record<string, string | null>
): TemplateContext => {
  const base = createSurgeryContext(patient, surgery, settings)
  return {
    ...base,
    followup: {
      date: followup?.created_at ? formatDateTime(followup.created_at) : null,
      notes: isEmptyHtml(followup?.notes) ? null : followup?.notes || null
    }
  }
}

// Print dialog data with new template system
export interface TemplatePrintData {
  title: string
  templateStructure: TemplateStructure
  templateContext: TemplateContext
}

export const createSurgeryPrintData = (
  patient: PatientModel | undefined,
  surgery: SurgeryModel | undefined,
  settings: Record<string, string | null> | undefined,
  template: TemplateStructure
): TemplatePrintData => ({
  title: `${patient?.name || 'Patient'} - ${surgery?.title || 'Surgery'}`,
  templateStructure: template,
  templateContext: createSurgeryContext(patient, surgery, settings)
})

export const createFollowupPrintData = (
  patient: PatientModel | undefined,
  surgery: SurgeryModel | undefined,
  followup: FollowupModel | undefined,
  settings: Record<string, string | null> | undefined,
  template: TemplateStructure
): TemplatePrintData => ({
  title: `${patient?.name || 'Patient'} - Follow-up`,
  templateStructure: template,
  templateContext: createFollowupContext(patient, surgery, followup, settings)
})
