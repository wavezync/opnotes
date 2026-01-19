import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { FormLayout, PageHeader, IconBox } from '@renderer/components/layouts'
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
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }])
  }, [setBreadcrumbs])

  return (
    <FormLayout
      header={
        <PageHeader
          icon={UserPlus}
          iconColor="violet"
          title="Add Doctor"
          subtitle="Register a new doctor to the system"
          showBackButton
          actions={
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
          }
        />
      }
      form={<AddOrEditDoctor onUpdated={handleCreated} ref={formRef} />}
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
                <IconBox icon={UserCog} color="violet" size="sm" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-xs text-muted-foreground">
                    Include title (Dr.) for proper report formatting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBox icon={Briefcase} color="blue" size="sm" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Designation</p>
                  <p className="text-xs text-muted-foreground">
                    Use abbreviations like GHO, MO, RMO, Consultant
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconBox icon={Award} color="emerald" size="sm" className="mt-0.5" />
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
        </>
      }
    />
  )
}
