import { NewPatientForm } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'
import { NewPatientFormRef } from '../../components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { RotateCcw, SaveIcon } from 'lucide-react'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'

export const AddNewPatient = () => {
  const navigate = useNavigate()
  const ref = useRef<NewPatientFormRef>(null)
  const { setBreadcrumbs } = useBreadcrumbs()
  const handleNewPatient = (patient: Patient) => {
    toast.success('Patient added successfully')
    navigate(`/patients/${patient.id}`)
  }

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      ref.current?.submit()
    }
  })

  const actions = (
    <>
      <Button
        variant="gradient"
        leftIcon={<SaveIcon className="h-4 w-4" />}
        onClick={() => {
          ref.current?.submit()
        }}
      >
        Save
      </Button>
      <Button
        variant="outline"
        leftIcon={<RotateCcw className="h-4 w-4" />}
        onClick={() => ref.current?.reset()}
      >
        Reset
      </Button>
    </>
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }, { label: 'Add Patient' }])
  }, [setBreadcrumbs])

  return (
    <AppLayout title="Add Patient" actions={actions}>
      <NewPatientForm onRecordUpdated={handleNewPatient} ref={ref} />
    </AppLayout>
  )
}
