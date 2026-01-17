import { PatientModel } from '@shared/models/PatientModel'
import { SurgeryModel } from '@shared/models/SurgeryModel'
import { formatDate, isEmptyHtml } from './utils'

export const surgeryPrintData = (
  patient?: PatientModel,
  surgery?: SurgeryModel,
  settings?: Record<string, string | null>
) => ({
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
