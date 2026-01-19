import { NewPatientForm, NewPatientFormRef } from '@renderer/components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { ArrowLeft, Save, UserPlus, Hash, Cake, Building2, Lightbulb } from 'lucide-react'
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
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Patient</h1>
            <p className="text-sm text-muted-foreground">
              Register a new patient to the system
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={() => {
            ref.current?.submit()
          }}
        >
          Save Patient
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <NewPatientForm onRecordUpdated={handleNewPatient} ref={ref} />
          </div>

          {/* Right: Tips Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Quick Tips
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Hash className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">PHN (Patient Hospital Number)</p>
                    <p className="text-xs text-muted-foreground">
                      The unique identifier assigned by the hospital
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Cake className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-xs text-muted-foreground">
                      Age will be calculated automatically from DOB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-violet-500" />
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
