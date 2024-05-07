import { NewPatientForm } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
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
    <AppLayout title="Add Patient">
      <NewPatientForm onRecordUpdated={handleNewPatient} />
    </AppLayout>
  )
}
