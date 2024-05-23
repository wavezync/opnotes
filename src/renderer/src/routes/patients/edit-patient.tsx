import { NewPatientForm } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'
import { queries } from '../../lib/queries'
import { AppLayout } from '@renderer/layouts/AppLayout'

export const getPatientByIdQuery = (id: number) =>
  queryOptions({
    ...queries.patients.get(id)
  })

export const EditPatient = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data, isLoading } = useQuery({ ...getPatientByIdQuery(parseInt(id!)), enabled: !!id })

  const handleNewPatient = (patient: Patient) => {
    queryClient.setQueryData(queries.patients.get(parseInt(id!)).queryKey, patient)
    toast.success('Patient updated successfully')
  }

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
    <AppLayout title="Edit Patient">
      {!isLoading && data && (
        <NewPatientForm onRecordUpdated={handleNewPatient} values={data} key={id} />
      )}
    </AppLayout>
  )
}
