import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { queries } from '@renderer/lib/queries'
import { useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'

export const AddNewDoctor = () => {
  const navigate = useNavigate()
  const formRef = useRef<AddOrEditDoctorRef>(null)
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()
  const handleNewPatient = (_doctor: DoctorModel) => {
    navigate(`/doctors`)
  }

  const actions = (
    <>
      <Button
        variant="default"
        onClick={async () => {
          formRef.current?.submit()
          await queryClient.invalidateQueries({ queryKey: queries.doctors.list({}).queryKey })
        }}
      >
        <Save /> Save
      </Button>
    </>
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }, { label: 'Add Doctor' }])
  }, [setBreadcrumbs])

  return (
    <AppLayout title="Add Doctor" actions={actions}>
      <AddOrEditDoctor onUpdated={handleNewPatient} ref={formRef} />
    </AppLayout>
  )
}
