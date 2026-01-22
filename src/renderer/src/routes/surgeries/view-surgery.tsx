import { Button } from '@renderer/components/ui/button'
import { PageLayout, PageHeader } from '@renderer/components/layouts'
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
  ClipboardList,
  FileOutput
} from 'lucide-react'
import { useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import { queries } from '@renderer/lib/queries'
import { SurgeryModel } from 'src/shared/models/SurgeryModel'
import { PatientModel } from 'src/shared/models/PatientModel'
import { Badge } from '@renderer/components/ui/badge'
import { AddOrEditFollowup } from '@renderer/components/surgery/AddOrEditFollowup'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { cn, formatDateTime, unwrapResult } from '@renderer/lib/utils'
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
import { useSettings } from '@renderer/contexts/SettingsContext'
import { createSurgeryContext, createFollowupContext } from '@renderer/lib/print'
import { PrintDialog } from '@renderer/components/print/PrintDialog'
import { toast } from '@renderer/components/ui/sonner'

import {
  InlineEditableRichText,
  InlineEditableText,
  InlineEditableDate,
  InlineEditableDoctors,
  EditableFieldCard
} from '@renderer/components/surgery/inline-edit'

const getSurgeryByIdQuery = (id: number) => queries.surgeries.get(id)
const getSurgeryFollowupsQuery = (surgeryId: number) => queries.surgeries.getFollowups(surgeryId)

// ============================================================
// Rich Text Content Display (for followups)
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
// Info Item Component (for non-editable display)
// ============================================================
interface InfoItemProps {
  icon: React.ElementType
  label: string
  iconBg: string
  iconColor: string
  children: React.ReactNode
}

const InfoItem = ({ icon: Icon, label, iconBg, iconColor, children }: InfoItemProps) => (
  <div className="flex items-center gap-3">
    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
      <Icon className={cn('h-4 w-4', iconColor)} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      {children}
    </div>
  </div>
)

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
  const { patientId: urlPatientId, surgeryId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { settings } = useSettings()
  const queryClient = useQueryClient()

  // Detect navigation context - if urlPatientId is not present, we came from surgeries list
  const isFromSurgeriesContext = !urlPatientId

  const { data: surgery } = useQuery({
    ...getSurgeryByIdQuery(parseInt(surgeryId!)),
    enabled: !!surgeryId
  })

  // Derive patientId from URL or from surgery data
  const patientId = urlPatientId ? parseInt(urlPatientId) : surgery?.patient_id

  const { data: patient } = useQuery({
    ...getPatientByIdQuery(patientId!),
    enabled: !!patientId
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
    if (isFromSurgeriesContext) {
      setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
    } else {
      setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
    }
  }, [setBreadcrumbs, isFromSurgeriesContext])

  const surgeryContext = patient && surgery ? createSurgeryContext(patient, surgery, settings) : null

  const noFollowups = !isFollowupLoading && followups && followups.length === 0

  // ============================================================
  // Field Update Mutations
  // ============================================================
  const updateSurgeryMutation = useMutation({
    mutationFn: async (data: { field: string; value: unknown }) => {
      if (!surgery) throw new Error('Surgery not found')
      const { result, error } = await window.api.invoke('updateSurgery', surgery.id, {
        [data.field]: data.value
      })
      if (error) throw new Error(error.message)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.surgeries.get(parseInt(surgeryId!)).queryKey })
      toast.success('Updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`)
    }
  })

  const updateDoctorsDoneByMutation = useMutation({
    mutationFn: async (doctorIds: number[]) => {
      if (!surgery) throw new Error('Surgery not found')
      return unwrapResult(window.api.invoke('updateSurgeryDoctorsDoneBy', surgery.id, doctorIds))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.surgeries.get(parseInt(surgeryId!)).queryKey })
      toast.success('Surgeons updated')
    },
    onError: (error) => {
      toast.error(`Failed to update surgeons: ${error.message}`)
    }
  })

  const updateDoctorsAssistedByMutation = useMutation({
    mutationFn: async (doctorIds: number[]) => {
      if (!surgery) throw new Error('Surgery not found')
      return unwrapResult(window.api.invoke('updateSurgeryDoctorsAssistedBy', surgery.id, doctorIds))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.surgeries.get(parseInt(surgeryId!)).queryKey })
      toast.success('Assistants updated')
    },
    onError: (error) => {
      toast.error(`Failed to update assistants: ${error.message}`)
    }
  })

  // ============================================================
  // Field Update Handlers
  // ============================================================
  const handleUpdateTextField = useCallback(
    (field: string) => async (value: string) => {
      await updateSurgeryMutation.mutateAsync({ field, value })
    },
    [updateSurgeryMutation]
  )

  const handleUpdateDateField = useCallback(
    (field: string) => async (value: Date | null) => {
      await updateSurgeryMutation.mutateAsync({ field, value: value ? +value : null })
    },
    [updateSurgeryMutation]
  )

  const handleUpdateDoneBy = useCallback(
    async (doctorIds: number[]) => {
      await updateDoctorsDoneByMutation.mutateAsync(doctorIds)
    },
    [updateDoctorsDoneByMutation]
  )

  const handleUpdateAssistedBy = useCallback(
    async (doctorIds: number[]) => {
      await updateDoctorsAssistedByMutation.mutateAsync(doctorIds)
    },
    [updateDoctorsAssistedByMutation]
  )

  return (
    <PageLayout
      header={
        <PageHeader
          icon={Stethoscope}
          iconColor="emerald"
          title={surgeryName}
          subtitle={
            <>
              Surgery record for{' '}
              <Link
                to={`/patients/${patient?.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {ptName}
              </Link>
            </>
          }
          showBackButton
          animate={false}
          actions={
            <>
              {surgeryContext && (
                <PrintDialog
                  templateType="surgery"
                  title={`${ptName} - ${surgeryName}`}
                  context={surgeryContext}
                />
              )}
              <Button
                variant="gradient"
                onClick={() =>
                  navigate(
                    isFromSurgeriesContext
                      ? `/surgeries/${surgeryId}/edit`
                      : `/patients/${patientId}/surgeries/${surgeryId}/edit`
                  )
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit All
              </Button>
            </>
          }
        />
      }
    >
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
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-500"
                  >
                    <InlineEditableText
                      value={surgery.bht}
                      onSave={handleUpdateTextField('bht')}
                      emptyPlaceholder="Add BHT..."
                      inputPlaceholder="BHT number"
                      mono
                    />
                  </InfoItem>
                  <InfoItem
                    icon={Building2}
                    label="Ward"
                    iconBg="bg-violet-500/10"
                    iconColor="text-violet-500"
                  >
                    <InlineEditableText
                      value={surgery.ward}
                      onSave={handleUpdateTextField('ward')}
                      emptyPlaceholder="Add ward..."
                      inputPlaceholder="Ward name"
                    />
                  </InfoItem>
                  <InfoItem
                    icon={Calendar}
                    label="Surgery Date"
                    iconBg="bg-emerald-500/10"
                    iconColor="text-emerald-500"
                  >
                    <InlineEditableDate
                      value={surgery.date}
                      onSave={handleUpdateDateField('date')}
                      emptyPlaceholder="Select date..."
                    />
                  </InfoItem>
                  <InfoItem
                    icon={Calendar}
                    label="Date of Admission"
                    iconBg="bg-amber-500/10"
                    iconColor="text-amber-500"
                  >
                    <InlineEditableDate
                      value={surgery.doa}
                      onSave={handleUpdateDateField('doa')}
                      emptyPlaceholder="Select date..."
                    />
                  </InfoItem>
                  <InfoItem
                    icon={Calendar}
                    label="Date of Discharge"
                    iconBg="bg-rose-500/10"
                    iconColor="text-rose-500"
                  >
                    <InlineEditableDate
                      value={surgery.dod}
                      onSave={handleUpdateDateField('dod')}
                      emptyPlaceholder="Select date..."
                    />
                  </InfoItem>
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
                  <InlineEditableDoctors
                    doctors={surgery.doneBy}
                    onSave={handleUpdateDoneBy}
                    emptyPlaceholder="No surgeons assigned"
                    doctorTypeLabel="surgeons"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Assisted By
                  </p>
                  <InlineEditableDoctors
                    doctors={surgery.assistedBy}
                    onSave={handleUpdateAssistedBy}
                    emptyPlaceholder="No assistants assigned"
                    doctorTypeLabel="assistants"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operative Notes Card */}
          <EditableFieldCard
            title="Operative Notes"
            icon={FileText}
            iconBgColor="bg-amber-500/10"
            iconColor="text-amber-500"
          >
            <InlineEditableRichText
              value={surgery.notes}
              onSave={handleUpdateTextField('notes')}
              emptyPlaceholder="Click to add operative notes..."
            />
          </EditableFieldCard>

          {/* Post-Op Notes Card */}
          <EditableFieldCard
            title="Post-Operative Care"
            icon={ClipboardPlus}
            iconBgColor="bg-rose-500/10"
            iconColor="text-rose-500"
          >
            <InlineEditableRichText
              value={surgery.post_op_notes}
              onSave={handleUpdateTextField('post_op_notes')}
              emptyPlaceholder="Click to add post-operative notes..."
            />
          </EditableFieldCard>

          {/* Inward Management Card */}
          <EditableFieldCard
            title="Inward Management"
            icon={Pill}
            iconBgColor="bg-purple-500/10"
            iconColor="text-purple-500"
          >
            <InlineEditableRichText
              value={surgery.inward_management}
              onSave={handleUpdateTextField('inward_management')}
              emptyPlaceholder="Click to add inward management..."
            />
          </EditableFieldCard>

          {/* Discharge Plan Card - Always visible */}
          <EditableFieldCard
            title="Discharge Plan"
            icon={ClipboardList}
            iconBgColor="bg-cyan-500/10"
            iconColor="text-cyan-500"
          >
            <InlineEditableRichText
              value={surgery.discharge_plan}
              onSave={handleUpdateTextField('discharge_plan')}
              emptyPlaceholder="Click to add discharge plan..."
            />
          </EditableFieldCard>

          {/* Referral Card - Always visible */}
          <EditableFieldCard
            title="Referral"
            icon={FileOutput}
            iconBgColor="bg-teal-500/10"
            iconColor="text-teal-500"
          >
            <InlineEditableRichText
              value={surgery.referral}
              onSave={handleUpdateTextField('referral')}
              emptyPlaceholder="Click to add referral..."
            />
          </EditableFieldCard>

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
    </PageLayout>
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
