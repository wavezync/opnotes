import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit,
  PlusIcon,
  Printer,
  Trash,
  Stethoscope,
  Hash,
  Building2,
  Calendar,
  Users,
  FileText,
  ClipboardPlus,
  Clock,
  ChevronRight,
  Pill,
  FileOutput
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import { queries } from '@renderer/lib/queries'
import { SurgeryModel } from 'src/shared/models/SurgeryModel'
import { PatientModel } from 'src/shared/models/PatientModel'
import { Badge } from '@renderer/components/ui/badge'
import { AddOrEditFollowup } from '@renderer/components/surgery/AddOrEditFollowup'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { cn, formatDate, formatDateTime, isEmptyHtml, unwrapResult } from '@renderer/lib/utils'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { FollowupModel } from 'src/shared/models/FollowupModel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import { DoctorModel } from '@shared/models/DoctorModel'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { createSurgeryContext, createFollowupContext } from '@renderer/lib/print'
import { PrintDialog } from '@renderer/components/print/PrintDialog'

const getSurgeryByIdQuery = (id: number) => queries.surgeries.get(id)
const getSurgeryFollowupsQuery = (surgeryId: number) => queries.surgeries.getFollowups(surgeryId)

// ============================================================
// Rich Text Content Display
// ============================================================
const RichTextContent = ({ content, className }: { content: string; className?: string }) => (
  <div
    className={cn(
      'prose prose-lead:normal prose-p:m-0 prose-li:m-0 [overflow-wrap:anywhere] dark:prose-invert prose-sm sm:prose-base',
      'focus:outline-none max-w-none',
      className
    )}
    dangerouslySetInnerHTML={{ __html: content || '' }}
  />
)

// ============================================================
// Empty State Component
// ============================================================
const EmptyState = ({ message, icon: Icon }: { message: string; icon?: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    {Icon && (
      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
      </div>
    )}
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
)

// ============================================================
// Info Item Component
// ============================================================
interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string | null | undefined
  iconBg: string
  iconColor: string
  mono?: boolean
}

const InfoItem = ({ icon: Icon, label, value, iconBg, iconColor, mono }: InfoItemProps) => (
  <div className="flex items-center gap-3">
    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
      <Icon className={cn('h-4 w-4', iconColor)} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn('text-sm font-medium truncate', mono && 'font-mono')}>{value || 'N/A'}</p>
    </div>
  </div>
)

// ============================================================
// Doctor List Component
// ============================================================
interface DoctorListProps {
  doctors: DoctorModel[] | undefined
  emptyMessage: string
}

const DoctorList = ({ doctors, emptyMessage }: DoctorListProps) => {
  if (!doctors || doctors.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-1.5">
      {doctors.map((doctor) => (
        <li key={doctor.id} className="flex items-center gap-2 text-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            <Link
              to={`/doctors/${doctor.id}/edit`}
              className="hover:text-primary hover:underline transition-colors"
            >
              Dr. {doctor.name}
            </Link>
            {doctor.designation && (
              <span className="text-muted-foreground ml-1">({doctor.designation})</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

// ============================================================
// Followup Card Component
// ============================================================
interface FollowupCardProps {
  followup: FollowupModel
  patient: PatientModel
  surgery: SurgeryModel
  settings?: Record<string, string | null>
}

const FollowupCard = ({ followup, patient, surgery, settings }: FollowupCardProps) => {
  const queryClient = useQueryClient()
  const deleteFollowupMutation = useMutation({
    mutationFn: () => unwrapResult(window.api.invoke('deleteFollowUp', followup.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queries.surgeries.getFollowups(followup.surgery_id).queryKey
      })
    }
  })

  const followupContext = createFollowupContext(patient, surgery, followup, settings)

  return (
    <div className="group relative p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDateTime(followup.created_at)}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <PrintDialog
            templateType="followup"
            title={`${patient.name || 'Patient'} - Follow-up`}
            context={followupContext}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Printer className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <AddOrEditFollowup
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            }
            followup={followup}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Follow-up</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this follow-up? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={() => deleteFollowupMutation.mutate()}>
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <RichTextContent content={followup.notes} />
    </div>
  )
}

// ============================================================
// Followup Shimmer
// ============================================================
const FollowupShimmer = () => (
  <div className="p-4 rounded-xl border bg-card">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-20 w-full rounded-lg" />
  </div>
)

// ============================================================
// Main View Surgery Component
// ============================================================
export const ViewSurgery = () => {
  const navigate = useNavigate()
  const { patientId, surgeryId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { settings } = useSettings()

  const { data: patient } = useQuery({
    ...getPatientByIdQuery(parseInt(patientId!)),
    enabled: !!patientId
  })

  const { data: surgery } = useQuery({
    ...getSurgeryByIdQuery(parseInt(surgeryId!)),
    enabled: !!surgeryId
  })

  const { data: followups, isLoading: isFollowupLoading } = useQuery({
    ...getSurgeryFollowupsQuery(parseInt(surgeryId!)),
    enabled: !!surgeryId
  })

  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  const surgeryName = useMemo(
    () => surgery?.title || surgery?.bht || 'Surgery',
    [surgery?.bht, surgery?.title]
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
  }, [setBreadcrumbs])

  const surgeryContext = patient && surgery ? createSurgeryContext(patient, surgery, settings) : null

  const noFollowups = !isFollowupLoading && followups && followups.length === 0

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{surgeryName}</h1>
            <p className="text-sm text-muted-foreground">
              Surgery record for{' '}
              <Link
                to={`/patients/${patient?.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {ptName}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {surgeryContext && (
            <PrintDialog
              templateType="surgery"
              title={`${ptName} - ${surgeryName}`}
              context={surgeryContext}
            />
          )}
          <Button
            variant="gradient"
            onClick={() => navigate(`/patients/${patientId}/surgeries/${surgeryId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {patient && surgery && (
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* Top Row: Details + Team */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Surgery Details Card */}
            <Card className="bg-gradient-to-br from-card to-card/80 lg:col-span-2">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Surgery Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoItem
                    icon={Hash}
                    label="BHT"
                    value={surgery.bht}
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-500"
                    mono
                  />
                  <InfoItem
                    icon={Building2}
                    label="Ward"
                    value={surgery.ward}
                    iconBg="bg-violet-500/10"
                    iconColor="text-violet-500"
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Surgery Date"
                    value={surgery.date ? formatDate(surgery.date) : null}
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-500"
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date of Admission"
                    value={surgery.doa ? formatDate(surgery.doa) : null}
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-500"
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date of Discharge"
                    value={surgery.dod ? formatDate(surgery.dod) : null}
                    iconBg="bg-rose-500/10"
                    iconColor="text-rose-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Surgical Team Card */}
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-violet-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Surgical Team
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Done By
                  </p>
                  <DoctorList doctors={surgery.doneBy} emptyMessage="No surgeons assigned" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Assisted By
                  </p>
                  <DoctorList doctors={surgery.assistedBy} emptyMessage="No assistants assigned" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Row */}
          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
            {/* Operative Notes Card */}
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Operative Notes
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {!isEmptyHtml(surgery.notes) ? (
                  <div className="p-4 rounded-lg bg-accent/30">
                    <RichTextContent content={surgery.notes!} />
                  </div>
                ) : (
                  <EmptyState message="No operative notes recorded" icon={FileText} />
                )}
              </CardContent>
            </Card>

            {/* Inward Management Card */}
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Pill className="h-4 w-4 text-purple-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Inward Management
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {!isEmptyHtml(surgery.inward_management) ? (
                  <div className="p-4 rounded-lg bg-accent/30">
                    <RichTextContent content={surgery.inward_management!} />
                  </div>
                ) : (
                  <EmptyState message="No inward management recorded" icon={Pill} />
                )}
              </CardContent>
            </Card>

            {/* Post-Op Notes Card */}
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <ClipboardPlus className="h-4 w-4 text-rose-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Post-Operative Care
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {!isEmptyHtml(surgery.post_op_notes) ? (
                  <div className="p-4 rounded-lg bg-accent/30">
                    <RichTextContent content={surgery.post_op_notes!} />
                  </div>
                ) : (
                  <EmptyState message="No post-operative notes recorded" icon={ClipboardPlus} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral Card - only show if content exists */}
          {!isEmptyHtml(surgery.referral) && (
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <FileOutput className="h-4 w-4 text-teal-500" />
                  </div>
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Referral
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-4 rounded-lg bg-accent/30">
                  <RichTextContent content={surgery.referral!} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-ups Card */}
          <Card className="bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Follow-ups
                    </CardTitle>
                    {followups && followups.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {followups.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <AddOrEditFollowup
                  trigger={
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Follow-up
                    </Button>
                  }
                  surgeryId={surgery.id}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isFollowupLoading && <FollowupShimmer />}

              {noFollowups && (
                <EmptyState message="No follow-up records yet" icon={ChevronRight} />
              )}

              {followups && followups.length > 0 && (
                <div className="space-y-3">
                  {followups.map((followup) => (
                    <FollowupCard
                      key={followup.id}
                      followup={followup}
                      patient={patient}
                      surgery={surgery}
                      settings={settings}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Re-export for backward compatibility
export interface SurgeryCardProps {
  surgery: SurgeryModel
  patient: PatientModel
  settings?: Record<string, string | null>
}

export const SurgeryCard = (_props: SurgeryCardProps) => {
  // This is kept for backward compatibility but the main view now uses inline components
  return null
}
