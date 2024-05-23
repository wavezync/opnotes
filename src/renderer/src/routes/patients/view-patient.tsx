import { Button } from '@renderer/components/ui/button'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { QueryClient, queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { EditIcon, MoreHorizontal, PlusSquare } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom'
import { PatientModel } from 'src/shared/models/PatientModel'
import { getPatientByIdQuery } from './edit-patient'
import { Card } from '@renderer/components/ui/card'
import { queries } from '@renderer/lib/queries'
import { Surgery } from '../../../../shared/types/db'
import { DataTable } from '@renderer/components/ui/data-table/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@renderer/components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { SurgeryFilter } from 'src/shared/types/api'
import { Input } from '@renderer/components/ui/input'
import { cn } from '@renderer/lib/utils'
import womenIcon from '../../../../../resources/woman.png?asset'
import manIcon from '../../../../../resources/man.png?asset'
import { LabeledChip } from '@renderer/components/common/LabeledChip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { id } = params as { id: string }
    await queryClient.ensureQueryData(getPatientByIdQuery(parseInt(id)))
    return { id }
  }

const surgeryListQuery = (filter: SurgeryFilter) =>
  queryOptions({ ...queries.surgeries.list(filter) })

interface PatientInfoCardProps {
  patient: PatientModel
  className?: string
}

const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  const remarksDialog = patient.remarks && (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Remarks
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remarks</DialogTitle>
          <DialogDescription asChild>
            <div className="dark">
              <div
                className="prose prose-slate dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: patient.remarks }}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

  return (
    <Card>
      <div className="p-5 md:flex w-full">
        <div className="h-36 w-36 flex items-center justify-center">
          <img
            src={patient.gender === 'M' ? manIcon : womenIcon}
            alt="Patient"
            className="w-24 h-24 shadow-sm rounded-full"
          />
        </div>
        <div className="flex flex-col w-full items-start ml-10">
          <div className="flex w-1/2 justify-between items-start">
            <div className="flex flex-col items-start gap-2">
              <LabeledChip label="PHN" value={patient.phn} />
              <LabeledChip label="Name" value={patient.name || 'N/A'} />
              <LabeledChip label="Age" value={<>{patient.age > 1 ? patient.age : '<1'} yrs</>} />
              <LabeledChip label="Gender" value={patient.gender} />
            </div>
            <div className="ml-10 flex flex-col items-start gap-2">
              <LabeledChip label="Ward" value={patient.ward || 'N/A'} />
              <LabeledChip label="Phone" value={patient.phone || 'N/A'} />
              <LabeledChip label="Emergency Contact" value={patient.emergency_contact || 'N/A'} />
              <LabeledChip label="Emergency Phone" value={patient.emergency_phone || 'N/A'} />
            </div>
          </div>
          <div className="flex my-2 ml-0">{remarksDialog}</div>
        </div>
      </div>
    </Card>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<Surgery, any>[] = [
  {
    id: 'bht',
    header: 'BHT',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}/surgeries/${cell.row.original.id}`}
        className="hover:underline"
      >
        {cell.row.original.bht}
      </Link>
    )
  },
  {
    id: 'title',
    header: 'Title',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}/surgeries/${cell.row.original.id}`}
        className="hover:underline"
      >
        {cell.row.original.title}
      </Link>
    )
  },
  {
    id: 'ward',
    header: 'Ward',
    cell: (cell) => cell.row.original.ward
  },
  {
    id: 'date',
    header: 'Surgery Date',
    cell: (cell) =>
      cell.row.original.date !== null ? cell.row.original.date.toLocaleDateString() : 'N/A'
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    cell: (cell) => cell.row.original.updated_at.toLocaleDateString()
  },
  {
    id: 'actions',
    cell: (cell) => {
      const record = cell.row.original

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(record.bht)
                toast.success('BHT copied to clipboard')
              }}
            >
              Copy BHT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`/patients/${record.patient_id}/surgeries/${record.id}`}>View Surgery</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/patients/${record.patient_id}/surgeries/${record.id}/edit`}>
                Edit Surgery
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

interface PatientSurgeryListProps {
  patientId: number
  className?: string
}

const PatientSurgeryList = ({ patientId, className }: PatientSurgeryListProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(
    surgeryListQuery({
      search,
      patient_id: patientId,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  )

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="py-2">
        <Input placeholder="Search by BHT, Title..." onChange={(e) => setSearch(e.target.value)} />
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        rowCount={data?.total}
        pagination={pagination}
        setPagination={setPagination}
        isLoading={isLoading}
      />
    </div>
  )
}

export const ViewPatient = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { id } = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>
  const { data: patient } = useSuspenseQuery(getPatientByIdQuery(parseInt(id)))

  const ptName = useMemo(
    () => patient?.name || patient?.phn || 'Patient',
    [patient?.name, patient?.phn]
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }, { label: ptName }])
  }, [ptName, setBreadcrumbs])

  const actions = (
    <>
      <Button
        variant="default"
        size={'sm'}
        leftIcon={<PlusSquare />}
        onClick={() => navigate(`/patients/${id}/surgeries/add`)}
      >
        Add Surgery
      </Button>
      <Button
        variant="secondary"
        size={'sm'}
        leftIcon={<EditIcon />}
        onClick={() => navigate(`/patients/${id}/edit`)}
      >
        Edit Patient
      </Button>
    </>
  )

  return (
    <AppLayout title={ptName} actions={actions}>
      <div className="flex flex-col">
        <PatientInfoCard patient={patient!} />
        <PatientSurgeryList patientId={parseInt(id)} className="mt-2" />
      </div>
    </AppLayout>
  )
}
