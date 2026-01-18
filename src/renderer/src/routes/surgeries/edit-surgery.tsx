import { Button } from '@renderer/components/ui/button'
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
    if (patient) {
      setBreadcrumbs([
        { label: 'Patients', to: '/patients' },
        { label: ptName, to: `/patients/${patient.id}` },
        { label: surgeryName, to: `/patients/${patient.id}/surgeries/${surgeryId}` },
        { label: 'Edit' }
      ])
    }
  }, [setBreadcrumbs, patient, ptName, surgeryName, surgeryId])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Surgery</h1>
            <p className="text-sm text-muted-foreground">
              Editing <span className="font-medium text-foreground font-mono">{surgeryName}</span> for{' '}
              <Link
                to={`/patients/${patient?.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {ptName}
              </Link>
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={() => formRef.current?.submit()}
        >
          Save Changes
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
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
      </div>
    </div>
  )
}
