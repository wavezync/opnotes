import { NewPatientForm, NewPatientFormRef } from '@renderer/components/patient/NewPatientForm'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useKeyboardEvent } from '@renderer/hooks/useKeyboardEvent'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Save, UserCog, Hash, Cake, User, Building2, Calendar, Eye } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from '@renderer/components/ui/sonner'
import { Link, useParams } from 'react-router-dom'
import { Patient } from 'src/shared/types/db'
import womenIcon from '../../../../../resources/woman.png?asset'
import manIcon from '../../../../../resources/man.png?asset'

export const getPatientByIdQuery = (id: number) =>
  queryOptions({
    ...queries.patients.get(id)
  })

export const EditPatient = () => {
  const { id } = useParams()
  const ref = useRef<NewPatientFormRef>(null)
  const queryClient = useQueryClient()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data, isLoading } = useQuery({ ...getPatientByIdQuery(parseInt(id!)), enabled: !!id })

  const handleUpdate = (patient: Patient) => {
    queryClient.invalidateQueries({
      queryKey: queries.patients.get(patient.id).queryKey
    })
    toast.success('Patient updated successfully')
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
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <UserCog className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Patient</h1>
            <p className="text-sm text-muted-foreground">
              Update details for {data?.name || data?.phn || 'patient'}
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
          Save Changes
        </Button>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            {!isLoading && data && (
              <NewPatientForm onRecordUpdated={handleUpdate} values={data} key={id} ref={ref} />
            )}
          </div>

          {/* Right: Patient Preview Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Current Info Preview */}
            <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden" style={{ animationDelay: '100ms' }}>
              <CardHeader className="pb-3 pt-4 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                <div className="flex items-center gap-2.5 relative">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Current Info
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {data && (
                  <>
                    {/* Patient Avatar and Name */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accent/50 p-0.5 shadow-theme-sm">
                        <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                          <img
                            src={data.gender === 'M' ? manIcon : womenIcon}
                            alt="Patient"
                            className="w-8 h-8"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/patients/${data.id}`} className="font-semibold truncate hover:text-primary hover:underline transition-colors block">
                          {data.name || 'Unknown'}
                        </Link>
                        <p className="text-sm text-muted-foreground font-mono">{data.phn}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Hash className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">PHN</p>
                          <p className="text-sm font-medium font-mono truncate">
                            {data.phn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Cake className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="text-sm font-medium">
                            {data.age > 1 ? data.age : '<1'} years
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0',
                          data.gender === 'M' ? 'bg-blue-500/10' : 'bg-pink-500/10'
                        )}>
                          <User className={cn(
                            'h-3.5 w-3.5',
                            data.gender === 'M' ? 'text-blue-500' : 'text-pink-500'
                          )} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="text-sm font-medium">
                            {data.gender === 'M' ? 'Male' : 'Female'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Ward</p>
                          <p className={cn('text-sm font-medium truncate', !data.ward && 'text-muted-foreground italic')}>
                            {data.ward || 'Not assigned'}
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
            <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border-emerald-500/20 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Changes will be reflected in all surgeries associated with this patient.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
