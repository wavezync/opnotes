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
import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/ui/data-table/data-table'

import { Input } from '@renderer/components/ui/input'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { queries } from '@renderer/lib/queries'
import { unwrapResult } from '@renderer/lib/utils'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import { EditIcon, PlusSquare, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { Link, useNavigate } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'

import { DoctorFilter } from 'src/shared/types/api'

const doctorListQuery = (filter: DoctorFilter) =>
  queryOptions({
    ...queries.doctors.list(filter),
    placeholderData: keepPreviousData
  })

const DoctorAction = ({ doctor }: { doctor: DoctorModel }) => {
  const queryClient = useQueryClient()
  const deleteDoctorMutation = useMutation({
    mutationFn: () => unwrapResult(window.api.invoke('deleteDoctorById', doctor.id)),
    onSuccess: () => {
      queryClient.invalidateQueries(queries.doctors.list({}))
    },
    onError: (_error) => {
      toast.error(
        'Failed to delete doctor. Please try again. This doctor may have associated records.'
      )
    }
  })

  return (
    <div className="flex space-x-1 items-center">
      <Button variant="outline" size={'icon'} className="w-5 h-5" asChild>
        <Link to={`/doctors/${doctor.id}/edit`}>
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
              This action cannot be undone. This will permanently delete the doctor.
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
const columns: ColumnDef<DoctorModel, any>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: (cell) => (
      <Link to={`/doctors/${cell.row.original.id}/edit`} className="hover:underline">
        {cell.row.original.name}
      </Link>
    )
  },
  {
    id: 'designation',
    header: 'Designation',
    cell: (cell) => cell.row.original.designation
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    cell: (cell) => cell.row.original.updated_at.toLocaleDateString()
  },
  {
    id: 'actions',
    cell: (cell) => <DoctorAction doctor={cell.row.original} />
  }
]

export const DoctorsIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(
    doctorListQuery({
      search,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  )

  const actions = (
    <div className="absolute right-1 space-x-1">
      <Button
        variant="default"
        leftIcon={<PlusSquare />}
        size={'sm'}
        onClick={() => navigate('/doctors/add')}
      >
        Add New
      </Button>
    </div>
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }])
  }, [setBreadcrumbs])

  return (
    <AppLayout title="Doctors" actions={actions}>
      <div className="mt-2 p-2 overflow-y-auto">
        <div className="flex pb-2">
          <Input
            type="text"
            placeholder="Search doctors by Name..."
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
