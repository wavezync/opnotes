import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Printer, Save } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import {
  AddOrEditSurgery,
  AddOrEditSurgeryRef
} from '@renderer/components/surgery/AddOrEditSurgery'
import { queries } from '@renderer/lib/queries'

export const AddNewSurgery = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formRef = useRef<AddOrEditSurgeryRef>(null)
  const { patientId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data: patient } = useQuery({
    ...getPatientByIdQuery(parseInt(patientId!)),
    enabled: !!patientId
  })
  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  useEffect(() => {
    if (patient) {
      setBreadcrumbs([
        { label: 'Patients', to: '/patients' },
        { label: ptName, to: `/patients/${patient.id}` },
        { label: 'Add Surgery' }
      ])
    }
  }, [setBreadcrumbs, patient, ptName])

  const actions = (
    <>
      <Button
        className=""
        variant="default"
        onClick={async () => {
          formRef.current?.submit()
          await queryClient.invalidateQueries({
            queryKey: queries.surgeries.list({ patient_id: parseInt(patientId!) }).queryKey
          })
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
    <AppLayout actions={actions} title="Add Surgery">
      {patient && (
        <AddOrEditSurgery
          ref={formRef}
          patientId={patient.id}
          onUpdated={(surgery) => {
            navigate(`/patients/${patient.id}/surgeries/${surgery.id}`)
          }}
        />
      )}
    </AppLayout>
  )
}
