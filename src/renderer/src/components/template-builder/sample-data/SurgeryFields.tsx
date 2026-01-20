import { useSampleData } from '../SampleDataContext'
import { FieldInput, FieldDate } from './FieldInput'

export const SurgeryFields = () => {
  const { sampleContext, updateField } = useSampleData()
  const { surgery } = sampleContext

  return (
    <div className="space-y-2">
      {/* Row 1: Surgery Title */}
      <FieldInput
        label="Surgery Title"
        value={surgery.title}
        onChange={(v) => updateField('surgery.title', v)}
      />

      {/* Row 2: BHT, Ward */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="BHT"
          value={surgery.bht}
          onChange={(v) => updateField('surgery.bht', v)}
          mono
        />
        <FieldInput
          label="Ward"
          value={surgery.ward}
          onChange={(v) => updateField('surgery.ward', v)}
        />
      </div>

      {/* Row 3: Dates */}
      <div className="grid grid-cols-3 gap-2">
        <FieldDate
          label="Surgery Date"
          value={surgery.date}
          onChange={(v) => updateField('surgery.date', v)}
        />
        <FieldDate
          label="Admission"
          value={surgery.doa}
          onChange={(v) => updateField('surgery.doa', v)}
        />
        <FieldDate
          label="Discharge"
          value={surgery.dod}
          onChange={(v) => updateField('surgery.dod', v)}
        />
      </div>

      {/* Row 4: Done By, Assisted By */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Done By"
          value={surgery.doneByAsString}
          onChange={(v) => updateField('surgery.doneByAsString', v)}
        />
        <FieldInput
          label="Assisted By"
          value={surgery.assistedByAsString}
          onChange={(v) => updateField('surgery.assistedByAsString', v)}
        />
      </div>
    </div>
  )
}
