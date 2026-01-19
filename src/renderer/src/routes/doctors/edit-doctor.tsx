import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { FormLayout, PageHeader, IconBox } from '@renderer/components/layouts'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, UserCog, Briefcase, Award, Calendar, Eye } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'
import { format } from 'date-fns'

export const EditDoctor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ ...queries.doctors.get(parseInt(id!)), enabled: !!id })
  const formRef = useRef<AddOrEditDoctorRef>(null)

  const { setBreadcrumbs } = useBreadcrumbs()
  const handleUpdated = (doctor: DoctorModel) => {
    queryClient.invalidateQueries({ queryKey: queries.doctors.get(doctor.id).queryKey })
    queryClient.invalidateQueries({ queryKey: queries.doctors.list._def })
    navigate(`/doctors/${doctor.id}`)
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
          icon={UserCog}
          iconColor="violet"
          title="Edit Doctor"
          subtitle={`Update details for ${data?.name || 'doctor'}`}
          showBackButton
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
        !isLoading && data && (
          <AddOrEditDoctor onUpdated={handleUpdated} ref={formRef} doctor={data} />
        )
      }
      sidebar={
        <>
          {/* Current Info Preview */}
          <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-3 pt-4 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
              <div className="flex items-center gap-2.5 relative">
                <IconBox icon={Eye} color="violet" size="lg" />
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current Info
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {data && (
                <>
                  {/* Doctor Avatar and Name */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <IconBox icon={UserCog} color="violet" size="xl" className="rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.designation || 'No designation'}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <IconBox icon={Briefcase} color="blue" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Designation</p>
                        <p className={cn('text-sm font-medium truncate', !data.designation && 'text-muted-foreground italic')}>
                          {data.designation || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <IconBox icon={Award} color="emerald" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">SLMC Registration</p>
                        <p className={cn('text-sm font-medium truncate', !data.slmc_reg_no && 'text-muted-foreground italic')}>
                          {data.slmc_reg_no || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <IconBox icon={Calendar} color="amber" size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Added</p>
                        <p className="text-sm font-medium">
                          {data.created_at ? format(new Date(data.created_at), 'MMM d, yyyy') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card className="bg-gradient-to-br from-violet-500/5 to-violet-600/5 border-violet-500/20 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Changes will be reflected in all surgeries where this doctor is assigned as surgeon or assistant.
              </p>
            </CardContent>
          </Card>
        </>
      }
    />
  )
}
