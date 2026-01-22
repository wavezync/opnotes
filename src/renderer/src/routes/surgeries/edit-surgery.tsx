import { Button } from '@renderer/components/ui/button'
import { FormLayout, PageHeader } from '@renderer/components/layouts'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import {
  AddOrEditSurgery,
  AddOrEditSurgeryRef
} from '@renderer/components/surgery/AddOrEditSurgery'
import { queries } from '@renderer/lib/queries'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'

const getSurgeryByIdQuery = (id: number) => queries.surgeries.get(id)

export const EditSurgery = () => {
  const queryClient = useQueryClient()
  const formRef = useRef<AddOrEditSurgeryRef>(null)
  const { patientId: urlPatientId, surgeryId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()

  // Detect navigation context - if urlPatientId is not present, we came from surgeries list
  const isFromSurgeriesContext = !urlPatientId

  const { data: surgery } = useQuery({
    ...getSurgeryByIdQuery(parseInt(surgeryId!)),
    enabled: !!surgeryId
  })

  // Derive patientId from URL or from surgery data
  const patientId = urlPatientId ? parseInt(urlPatientId) : surgery?.patient_id

  const { data: patient } = useQuery({
    ...getPatientByIdQuery(patientId!),
    enabled: !!patientId
  })

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      console.log('submitting')
      formRef.current?.submit()
    }
  })

  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  const surgeryName = useMemo(() => surgery?.bht || 'Surgery', [surgery?.bht])

  useEffect(() => {
    if (isFromSurgeriesContext) {
      setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
    } else {
      setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
    }
  }, [setBreadcrumbs, isFromSurgeriesContext])

  return (
    <FormLayout
      header={
        <PageHeader
          icon={Stethoscope}
          iconColor="emerald"
          title="Edit Surgery"
          subtitle={
            <>
              Editing{' '}
              <Link
                to={
                  isFromSurgeriesContext
                    ? `/surgeries/${surgery?.id}`
                    : `/patients/${patient?.id}/surgeries/${surgery?.id}`
                }
                className="font-medium text-foreground font-mono hover:text-primary hover:underline transition-colors"
              >
                {surgeryName}
              </Link>{' '}
              for{' '}
              <Link
                to={`/patients/${patient?.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {ptName}
              </Link>
            </>
          }
          showBackButton
          animate={false}
          actions={
            <Button
              variant="gradient"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => formRef.current?.submit()}
            >
              Save Changes
            </Button>
          }
        />
      }
      form={
        patient && surgery && (
          <AddOrEditSurgery
            ref={formRef}
            patientId={patient.id}
            surgery={surgery}
            onUpdated={async (_surgery) => {
              await queryClient.invalidateQueries({
                queryKey: queries.surgeries.list({ patient_id: patientId! }).queryKey
              })
              await queryClient.invalidateQueries({
                queryKey: queries.surgeries.get(parseInt(surgeryId!)).queryKey
              })
              await queryClient.invalidateQueries({
                queryKey: queries.patients.get(patient.id).queryKey
              })
            }}
          />
        )
      }
    />
  )
}
