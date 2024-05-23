import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, PlusIcon, Printer, Trash } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPatientByIdQuery } from '../patients/edit-patient'
import { queries } from '@renderer/lib/queries'
import { SurgeryModel } from 'src/shared/models/SurgeryModel'
import { PatientModel } from 'src/shared/models/PatientModel'
import { Badge } from '@renderer/components/ui/badge'
import { AddOrEditFollowup } from '@renderer/components/surgery/AddOrEditFollowup'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'
import { cn, unwrapResult } from '@renderer/lib/utils'
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

const getSurgeryByIdQuery = (id: number) => queries.surgeries.get(id)
const getSurgeryFollowupsQuery = (surgeryId: number) => queries.surgeries.getFollowups(surgeryId)

export interface SurgeryCardProps {
  surgery: SurgeryModel
  patient: PatientModel
}

const FollowupShimmer = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 " />
        <Skeleton className="h-4" />
      </div>
    </div>
  )
}

interface FollowupCardProps {
  followup: FollowupModel
}

const FollowupCard = ({ followup }: FollowupCardProps) => {
  const queryClient = useQueryClient()
  const deleteFollowupMutation = useMutation({
    mutationFn: () => unwrapResult(window.api.invoke('deleteFollowUp', followup.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queries.surgeries.getFollowups(followup.surgery_id).queryKey
      })
    }
  })

  return (
    <Card className="mb-2 border rounded-lg mt-1 hover:bg-secondary/10">
      <CardHeader className="flex justify-end items-center flex-row w-full space-x-1">
        <span>{followup.created_at.toLocaleString()}</span>

        <AddOrEditFollowup
          trigger={
            <Button variant="secondary" size="icon" className="!mt-0 !w-8 !h-8">
              <Edit className="w-4 h-4" />
            </Button>
          }
          followup={followup}
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="!mt-0 !w-8 !h-8">
              <Trash className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the followup.
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
      </CardHeader>
      <CardContent>
        <RichTextContent content={followup.notes} />
      </CardContent>
    </Card>
  )
}

const RichTextContent = ({ content, className }: { content: string; className?: string }) => (
  <div
    className={cn(
      'prose prose-lead:normal prose-p:m-0 prose-li:m-0 [overflow-wrap:anywhere] dark:prose-invert prose-sm sm:prose-base ',
      'focus:outline-none prose-invert max-w-none ',
      className
    )}
    dangerouslySetInnerHTML={{ __html: content || '' }}
  />
)

const NoContentCard = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => (
  <Card className={cn('p-1 hover:bg-secondary/10', className)}>
    <CardHeader className="text-center">{children}</CardHeader>
  </Card>
)

export const SurgeryCard = ({ surgery, patient }: SurgeryCardProps) => {
  const { data: followups, isLoading: isFollowupLoading } = useQuery({
    ...getSurgeryFollowupsQuery(surgery.id)
  })

  const noFollowups = !isFollowupLoading && followups && followups.length === 0

  return (
    <div className="flex rounded-lg shadow-md p-4 flex-col">
      <div className=" text-lg flex md:flex-row flex-col">
        <div className="">
          <span className="font-semibold">Patient:</span>{' '}
          <Badge variant={'secondary'}>{patient.name}</Badge>
        </div>

        <div className="md:ml-4">
          <span className="font-semibold">BHT:</span>{' '}
          <Badge variant={'secondary'}>{surgery.bht}</Badge>
        </div>

        <div className="md:ml-4">
          <span className="font-semibold">Ward:</span>{' '}
          <Badge variant={'secondary'}>{surgery.ward}</Badge>
        </div>

        <div className="md:ml-4">
          <span className="font-semibold">Date:</span>{' '}
          <Badge variant={'secondary'}>{surgery.date?.toLocaleDateString()}</Badge>
        </div>
      </div>

      <div className="flex md:flex-row flex-col">
        <div className="flex flex-col mt-2 md:w-1/2 w-full">
          <span className="font-semibold">Done By:</span>
          {surgery.doneBy && surgery.doneBy.length > 0 ? (
            <ul className="list-disc pl-5">
              {surgery.doneBy?.map((doctor) => (
                <li key={doctor.id} className="">
                  {doctor.name}
                  {doctor.designation && <>({doctor.designation})</>}
                </li>
              ))}
            </ul>
          ) : (
            <span>N/A</span>
          )}
        </div>

        <div className="flex flex-col mt-2 md:w-1/2 w-full">
          <span className="font-semibold">Assisted By:</span>
          {surgery.assistedBy && surgery.assistedBy.length > 0 ? (
            <ul className="list-disc pl-5">
              {surgery.assistedBy?.map((doctor) => (
                <li key={doctor.id} className="">
                  {doctor.name}
                  {doctor.designation && <>({doctor.designation})</>}
                </li>
              ))}
            </ul>
          ) : (
            <span>N/A</span>
          )}
        </div>
      </div>

      <div className="flex flex-col mt-2">
        <span className="font-semibold text-2xl">Notes</span>

        {surgery.notes ? (
          <RichTextContent
            content={surgery.notes}
            className="p-2 border rounded-lg mt-1 hover:bg-secondary/10"
          />
        ) : (
          <NoContentCard className="mt-2">
            <span>No notes available</span>
          </NoContentCard>
        )}
      </div>

      <div className="flex flex-col mt-2">
        <span className="font-semibold text-2xl">Post Op Notes</span>

        {surgery.post_op_notes ? (
          <RichTextContent
            content={surgery.post_op_notes}
            className="p-2 border rounded-lg mt-1 hover:bg-secondary/10"
          />
        ) : (
          <NoContentCard className="mt-2">
            <span>No post op notes available</span>
          </NoContentCard>
        )}
      </div>

      <div className="flex flex-col mt-2">
        <span className="font-semibold text-2xl items-center justify-between flex">
          Followups
          <AddOrEditFollowup
            trigger={
              <Button variant="default" size="sm">
                <PlusIcon /> Add Followup
              </Button>
            }
            surgeryId={surgery.id}
          />
        </span>

        <div className="pt-2">
          {isFollowupLoading && <FollowupShimmer />}

          {noFollowups && (
            <NoContentCard>
              <span>No followups available</span>
            </NoContentCard>
          )}

          {followups?.map((followup) => <FollowupCard key={followup.id} followup={followup} />)}
        </div>
      </div>
    </div>
  )
}

export const ViewSurgery = () => {
  const navigate = useNavigate()
  const { patientId, surgeryId } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { data: patient } = useQuery({
    ...getPatientByIdQuery(parseInt(patientId!)),
    enabled: !!patientId
  })

  const { data: surgery } = useQuery({
    ...getSurgeryByIdQuery(parseInt(surgeryId!)),
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
    if (patient) {
      setBreadcrumbs([
        { label: 'Patients', to: '/patients' },
        { label: ptName, to: `/patients/${patient.id}` },
        { label: surgery?.bht || 'Surgery', to: `/patients/${patient.id}/surgeries/${surgeryId}` }
      ])
    }
  }, [setBreadcrumbs, patient, ptName, surgeryName, surgeryId, surgery?.bht])

  const actions = (
    <>
      <Button
        className=""
        variant="default"
        onClick={() => {
          navigate(`/patients/${patientId}/surgeries/${surgeryId}/edit`)
        }}
      >
        <Edit /> Edit
      </Button>
      <Button className="" variant="secondary">
        <Printer /> Print
      </Button>
    </>
  )

  return (
    <AppLayout actions={actions} title={surgeryName}>
      {patient && surgery && <SurgeryCard surgery={surgery} patient={patient} />}
    </AppLayout>
  )
}
