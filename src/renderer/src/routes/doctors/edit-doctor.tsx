import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { queries } from '@renderer/lib/queries'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'

export const EditDoctor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ ...queries.doctors.get(parseInt(id!)), enabled: !!id })
  const formRef = useRef<AddOrEditDoctorRef>(null)

  const { setBreadcrumbs } = useBreadcrumbs()
  const handleNewPatient = (_doctor: DoctorModel) => {
    navigate(`/doctors`)
  }

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      formRef.current?.submit()
    }
  })

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
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }, { label: data?.name || 'Doctor' }])
  }, [setBreadcrumbs, data?.name])

  return (
    <AppLayout title="Edit Doctor" actions={actions}>
      {!isLoading && data && (
        <AddOrEditDoctor onUpdated={handleNewPatient} ref={formRef} doctor={data} />
      )}
    </AppLayout>
  )
}
