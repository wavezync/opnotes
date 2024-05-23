import { NewPatientForm, NewPatientFormRef } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'
import { queries } from '../../lib/queries'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { Button } from '@renderer/components/ui/button'
import { SaveIcon } from 'lucide-react'

export const getPatientByIdQuery = (id: number) =>
  queryOptions({
    ...queries.patients.get(id)
  })

export const EditPatient = () => {
  const { id } = useParams()
  const ref = useRef<NewPatientFormRef>(null)
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data, isLoading } = useQuery({ ...getPatientByIdQuery(parseInt(id!)), enabled: !!id })

  const handleNewPatient = (patient: Patient) => {
    queryClient.setQueryData(queries.patients.get(parseInt(id!)).queryKey, patient)
    toast.success('Patient updated successfully')
  }

  const actions = (
    <>
      <Button
        onClick={() => {
          ref.current?.submit()
        }}
      >
        <SaveIcon className="w-5 h-5 mr-1" /> Save
      </Button>
      <Button variant="secondary" onClick={() => ref.current?.reset()}>
        Reset
      </Button>
    </>
  )

  const ptName = useMemo(() => data?.name || data?.phn || 'Patient', [data?.name, data?.phn])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Patients', to: '/patients' },
      {
        label: ptName,
        to: `/patients/${id}`
      },
      { label: 'Edit' }
    ])
  }, [ptName, id, setBreadcrumbs])

  return (
    <AppLayout title="Edit Patient" actions={actions}>
      {!isLoading && data && (
        <NewPatientForm onRecordUpdated={handleNewPatient} values={data} key={id} ref={ref} />
      )}
    </AppLayout>
  )
}
