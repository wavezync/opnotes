import { Breadcrumbs } from '@renderer/components/common/Breadcrumbs'
import { SectionTitle } from '@renderer/components/common/SectionHeader'
import { NewPatientForm } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'

export const AddNewPatient = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()
  const handleNewPatient = (patient: Patient) => {
    toast.success('Patient added successfully')
    navigate(`/patients/${patient.id}`)
  }

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }, { label: 'Add Patient' }])
  }, [setBreadcrumbs])

  return (
    <div className="flex flex-col h-full">
      <div className="text-center relative flex md:items-center md:justify-center mb-2">
        <div className="absolute left-0 top-0">
          <Breadcrumbs />
        </div>

        <SectionTitle title="Add Patient" />
      </div>
      <div className="p-2 overflow-y-auto">
        <NewPatientForm onRecordUpdated={handleNewPatient} />
      </div>
    </div>
  )
}
