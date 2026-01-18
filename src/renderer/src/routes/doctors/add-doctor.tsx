import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { queries } from '@renderer/lib/queries'
import { useQueryClient } from '@tanstack/react-query'
import { Save, UserPlus, UserCog, Briefcase, Award, Lightbulb } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'

export const AddNewDoctor = () => {
  const navigate = useNavigate()
  const formRef = useRef<AddOrEditDoctorRef>(null)
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()

  const handleCreated = (_doctor: DoctorModel) => {
    navigate(`/doctors`)
  }

  useKeyboardEvent({
    key: 's',
    ctrlKey: true,
    onKeyDown: () => {
      formRef.current?.submit()
    }
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }, { label: 'Add Doctor' }])
  }, [setBreadcrumbs])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add Doctor</h1>
            <p className="text-sm text-muted-foreground">
              Register a new doctor to the system
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={async () => {
            formRef.current?.submit()
            await queryClient.invalidateQueries({ queryKey: queries.doctors.list({}).queryKey })
          }}
        >
          Save Doctor
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <AddOrEditDoctor onUpdated={handleCreated} ref={formRef} />
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
                  <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCog className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-xs text-muted-foreground">
                      Include title (Dr.) for proper report formatting
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Designation</p>
                    <p className="text-xs text-muted-foreground">
                      Use abbreviations like GHO, MO, RMO, Consultant
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">SLMC Number</p>
                    <p className="text-xs text-muted-foreground">
                      Optional but useful for official documentation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Card className="bg-gradient-to-br from-violet-500/5 to-violet-600/5 border-violet-500/20 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Doctors</span> can be assigned to surgeries as the operating surgeon or assistant. Their details appear on printed surgery reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
