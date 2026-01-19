import { NewPatientForm, NewPatientFormRef } from '@renderer/components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { FormLayout, PageHeader, IconBox } from '@renderer/components/layouts'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { Save, UserPlus, Hash, Cake, Building2, Lightbulb } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from '@renderer/components/ui/sonner'
import { useNavigate } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'

export const AddNewPatient = () => {
  const navigate = useNavigate()
  const ref = useRef<NewPatientFormRef>(null)
  const { setBreadcrumbs } = useBreadcrumbs()

  const handleNewPatient = (patient: Patient) => {
    toast.success('Patient added successfully')
    navigate(`/patients/${patient.id}`)
  }

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      ref.current?.submit()
    }
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
  }, [setBreadcrumbs])

  return (
    <FormLayout
      header={
        <PageHeader
          icon={UserPlus}
          iconColor="emerald"
          title="Add Patient"
          subtitle="Register a new patient to the system"
          showBackButton
          actions={
            <Button
              variant="gradient"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={() => {
                ref.current?.submit()
              }}
            >
              Save Patient
            </Button>
          }
        />
      }
      form={<NewPatientForm onRecordUpdated={handleNewPatient} ref={ref} />}
      sidebar={
        <>
          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-2.5">
                <IconBox icon={Lightbulb} color="amber" size="lg" />
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quick Tips
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-start gap-3">
                <IconBox icon={Hash} color="blue" size="sm" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">PHN (Patient Hospital Number)</p>
                  <p className="text-xs text-muted-foreground">
                    The unique identifier assigned by the hospital
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBox icon={Cake} color="emerald" size="sm" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p className="text-xs text-muted-foreground">
                    Age will be calculated automatically from DOB
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBox icon={Building2} color="violet" size="sm" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ward</p>
                  <p className="text-xs text-muted-foreground">
                    Current ward assignment (can be updated later)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/20 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Patients</span> can have multiple surgeries associated with them. After adding a patient, you can create surgery records for their procedures.
              </p>
            </CardContent>
          </Card>
        </>
      }
    />
  )
}
