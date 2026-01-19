import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Stethoscope } from 'lucide-react'
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
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Surgery</h1>
            <p className="text-sm text-muted-foreground">
              Recording new surgery for{' '}
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
          Save Surgery
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {patient && (
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
        )}
      </div>
    </div>
  )
}
