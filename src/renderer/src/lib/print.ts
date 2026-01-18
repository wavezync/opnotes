import { PatientModel } from '@shared/models/PatientModel'
import { SurgeryModel } from '@shared/models/SurgeryModel'
import { FollowupModel } from '@shared/models/FollowupModel'
import { formatDate, formatDateTime, isEmptyHtml } from './utils'

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
    post_op_notes: isEmptyHtml(surgery?.post_op_notes) ? null : surgery?.post_op_notes
  },
  settings: {
    hospital: settings?.hospital || '',
    unit: settings?.unit || '',
    telephone: settings?.telephone || ''
  }
})

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
