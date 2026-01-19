import { Button } from '@renderer/components/ui/button'
import { FormLayout, PageHeader } from '@renderer/components/layouts'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import {
  AddOrEditSurgery,
  AddOrEditSurgeryRef
} from '@renderer/components/surgery/AddOrEditSurgery'
import { queries } from '@renderer/lib/queries'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'

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

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      formRef.current?.submit()
    }
  })

  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
  }, [setBreadcrumbs])

  return (
    <FormLayout
      header={
        <PageHeader
          icon={Stethoscope}
          iconColor="emerald"
          title="Add Surgery"
          subtitle={
            <>
              Recording new surgery for{' '}
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
              Save Surgery
            </Button>
          }
        />
      }
      form={
        patient && (
          <AddOrEditSurgery
            ref={formRef}
            patientId={patient.id}
            onUpdated={async (surgery) => {
              await queryClient.invalidateQueries({
                queryKey: queries.surgeries.list({ patient_id: parseInt(patientId!) }).queryKey
              })
              navigate(`/patients/${patient.id}/surgeries/${surgery.id}`)
            }}
          />
        )
      }
    />
  )
}
