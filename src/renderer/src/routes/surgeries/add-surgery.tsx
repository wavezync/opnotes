import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useQuery } from '@tanstack/react-query'
import { Printer, Save } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import { AddOrEditSurgery } from '@renderer/components/surgery/AddOrEditSurgery'

export const AddNewSurgery = () => {
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
      <Button className="" variant="default">
        <Save /> Save
      </Button>
      <Button className="" variant="secondary">
        <Printer /> Print
      </Button>
    </>
  )

  return (
    <AppLayout actions={actions} title="Add Surgery">
      <AddOrEditSurgery />
    </AppLayout>
  )
}
