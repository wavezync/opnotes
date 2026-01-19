import { AddOrEditDoctor, AddOrEditDoctorRef } from '@renderer/components/doctor/AddOrEditDoctor'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, UserCog, Briefcase, Award, Calendar, Eye } from 'lucide-react'
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
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <UserCog className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Doctor</h1>
            <p className="text-sm text-muted-foreground">
              Update details for {data?.name || 'doctor'}
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

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            {!isLoading && data && (
              <AddOrEditDoctor onUpdated={handleUpdated} ref={formRef} doctor={data} />
            )}
          </div>

          {/* Right: Doctor Preview Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Current Info Preview */}
            <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3 pt-4 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                <div className="flex items-center gap-2.5 relative">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-violet-500" />
                  </div>
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
                      <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <UserCog className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{data.name}</p>
                        <p className="text-sm text-muted-foreground">{data.designation || 'No designation'}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Designation</p>
                          <p className={cn('text-sm font-medium truncate', !data.designation && 'text-muted-foreground italic')}>
                            {data.designation || 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">SLMC Registration</p>
                          <p className={cn('text-sm font-medium truncate', !data.slmc_reg_no && 'text-muted-foreground italic')}>
                            {data.slmc_reg_no || 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
