import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Printer, Save } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import {
  AddOrEditSurgery,
  AddOrEditSurgeryRef
} from '@renderer/components/surgery/AddOrEditSurgery'
import { queries } from '@renderer/lib/queries'

const getSurgeryByIdQuery = (id: number) => queries.surgeries.get(id)

export const EditSurgery = () => {
  const queryClient = useQueryClient()
  const formRef = useRef<AddOrEditSurgeryRef>(null)
  const { patientId, surgeryId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data: patient } = useQuery({
    ...getPatientByIdQuery(parseInt(patientId!)),
    enabled: !!patientId
  })

  const { data: surgery } = useQuery({
    ...getSurgeryByIdQuery(parseInt(surgeryId!)),
    enabled: !!surgeryId
  })

  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  const surgeryName = useMemo(() => surgery?.bht || 'Surgery', [surgery?.bht])

  useEffect(() => {
    if (patient) {
      setBreadcrumbs([
        { label: 'Patients', to: '/patients' },
        { label: ptName, to: `/patients/${patient.id}` },
        { label: surgeryName, to: `/patients/${patient.id}/surgeries/${surgeryId}` },
        { label: 'Edit' }
      ])
    }
  }, [setBreadcrumbs, patient, ptName, surgeryName, surgeryId])

  const actions = (
    <>
      <Button
        className=""
        variant="default"
        onClick={async () => {
          formRef.current?.submit()
        }}
      >
        <Save /> Save
      </Button>
      <Button className="" variant="secondary">
        <Printer /> Print
      </Button>
    </>
  )

  return (
    <AppLayout actions={actions} title={`Edit ${surgery?.bht}`}>
      {patient && surgery && (
        <AddOrEditSurgery
          ref={formRef}
          patientId={patient.id}
          surgery={surgery}
          onUpdated={async (_surgery) => {
            await queryClient.invalidateQueries({
              queryKey: queries.surgeries.list({ patient_id: parseInt(patientId!) }).queryKey
            })
            await queryClient.invalidateQueries({
              queryKey: queries.surgeries.get(parseInt(surgeryId!)).queryKey
            })
            await queryClient.invalidateQueries({
              queryKey: queries.patients.get(patient.id).queryKey
            })
          }}
        />
      )}
    </AppLayout>
  )
}
