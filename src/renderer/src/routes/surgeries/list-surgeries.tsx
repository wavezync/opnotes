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
import { Button, buttonVariants } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/ui/data-table/data-table'

import { Input } from '@renderer/components/ui/input'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { queries } from '@renderer/lib/queries'
import { cn, formatDate, formatDateTime, unwrapResult } from '@renderer/lib/utils'
import { SurgeryModel } from '@shared/models/SurgeryModel'
import { SurgeryFilter } from '@shared/types/api'

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import { ArrowRight, EditIcon, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Link } from 'react-router-dom'

const surgeryListQuery = (filter: SurgeryFilter) =>
  queryOptions({
    ...queries.surgeries.list(filter),
    placeholderData: keepPreviousData
  })

const SurgeryAction = ({ surgery }: { surgery: SurgeryModel }) => {
  const queryClient = useQueryClient()
  const deleteDoctorMutation = useMutation({
    mutationFn: () => unwrapResult(window.api.invoke('deleteSurgeryById', surgery.id)),
    onSuccess: () => {
      queryClient.invalidateQueries(queries.surgeries.list({}))
    },
    onError: (_error) => {
      toast.error(
        'Failed to delete surgery. Please try again. This surgery may have associated records.'
      )
    }
  })

  return (
    <div className="flex space-x-1 items-center">
      <Button variant="outline" size={'icon'} className="w-5 h-5" asChild>
        <Link to={`/patients/${surgery.patient_id}/surgeries/${surgery.id}/edit`}>
          <EditIcon className="w-4 h-4" />
        </Link>
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon" className="!mt-0 !w-5 !h-5">
            <Trash className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the surgery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => deleteDoctorMutation.mutate()}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<SurgeryModel, any>[] = [
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
    id: 'surgeryDate',
    header: 'Surgery Date',
    cell: (cell) => (cell.row.original.date ? formatDate(cell.row.original.date) : 'N/A')
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    cell: (cell) => formatDateTime(cell.row.original.updated_at)
  },
  {
    id: 'patient',
    header: 'Patient',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}`}
        className={cn(
          'hover:underline',
          buttonVariants({ variant: 'link', size: 'sm' }),
          'p-0',
          'm-0'
        )}
      >
        <ArrowRight className="h-6 w-6 p-1" /> Go to Patient
      </Link>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (cell) => <SurgeryAction surgery={cell.row.original} />
  }
]

export const SurgierisIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(
    surgeryListQuery({
      search,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
  }, [setBreadcrumbs])

  return (
    <AppLayout title="Surgeries">
      <div className="mt-2 p-2 overflow-y-auto">
        <div className="flex pb-2">
          <Input
            type="text"
            placeholder="Search by BHT, PHN or Patient Name..."
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
    </AppLayout>
  )
}
