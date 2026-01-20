import { useSampleData } from '../SampleDataContext'
import { FieldInput, FieldSelect, FieldNumber } from './FieldInput'

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' }
]

const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

export const PatientFields = () => {
  const { sampleContext, updateField } = useSampleData()
  const { patient } = sampleContext

  return (
    <div className="space-y-2">
      {/* Row 1: Name, PHN */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Name"
          value={patient.name}
          onChange={(v) => updateField('patient.name', v)}
        />
        <FieldInput
          label="PHN"
          value={patient.phn}
          onChange={(v) => updateField('patient.phn', v)}
          mono
        />
      </div>

      {/* Row 2: Age, Gender, Blood Group */}
      <div className="grid grid-cols-3 gap-2">
        <FieldNumber
          label="Age"
          value={patient.age}
          onChange={(v) => updateField('patient.age', v)}
          min={0}
          max={150}
        />
        <FieldSelect
          label="Gender"
          value={patient.gender}
          options={GENDER_OPTIONS}
          onChange={(v) => updateField('patient.gender', v)}
        />
        <FieldSelect
          label="Blood Group"
          value={patient.blood_group}
          options={BLOOD_GROUP_OPTIONS}
          onChange={(v) => updateField('patient.blood_group', v)}
        />
      </div>

      {/* Row 3: Phone, Address */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Phone"
          value={patient.phone}
          onChange={(v) => updateField('patient.phone', v)}
        />
        <FieldInput
          label="Address"
          value={patient.address}
          onChange={(v) => updateField('patient.address', v)}
        />
      </div>

      {/* Row 4: Allergies, Conditions */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Allergies"
          value={patient.allergies}
          onChange={(v) => updateField('patient.allergies', v)}
        />
        <FieldInput
          label="Medical Conditions"
          value={patient.conditions}
          onChange={(v) => updateField('patient.conditions', v)}
        />
      </div>

      {/* Row 5: Emergency Contact */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Emergency Contact"
          value={patient.emergency_contact}
          onChange={(v) => updateField('patient.emergency_contact', v)}
        />
        <FieldInput
          label="Emergency Phone"
          value={patient.emergency_phone}
          onChange={(v) => updateField('patient.emergency_phone', v)}
        />
      </div>
    </div>
  )
}
