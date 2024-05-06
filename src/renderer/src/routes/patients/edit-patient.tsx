import { Breadcrumbs } from '@renderer/components/common/Breadcrumbs'
import { SectionTitle } from '@renderer/components/common/SectionHeader'
import { NewPatientForm } from '@renderer/components/patient/NewPatientForm'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'
import { queries } from '../../lib/queries'

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

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }, { label: 'Edit' }])
  }, [setBreadcrumbs])

  return (
    <div className="flex flex-col h-full">
      <div className="text-center relative flex md:items-center md:justify-center mb-2">
        <div className="absolute left-0 top-0">
          <Breadcrumbs />
        </div>

        <SectionTitle title="Edit Patient" />
      </div>
      <div className="p-2 overflow-y-auto">
        {!isLoading && <NewPatientForm onRecordUpdated={handleNewPatient} values={data} key={id} />}
      </div>
    </div>
  )
}
