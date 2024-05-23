import { Button } from '@renderer/components/ui/button'
import { DataTable } from '@renderer/components/ui/data-table/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Input } from '@renderer/components/ui/input'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { queries } from '@renderer/lib/queries'
import { QueryClient, keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import { MoreHorizontal, PlusSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, LoaderFunctionArgs, useNavigate } from 'react-router-dom'
import { PatientModel } from 'src/shared/models/PatientModel'
import { PatientFilter } from 'src/shared/types/api'

const patientListQuery = (filter: PatientFilter) =>
  queryOptions({
    ...queries.patients.list(filter),
    placeholderData: keepPreviousData
  })

export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10')
    await queryClient.ensureQueryData(patientListQuery({ search: q, page, pageSize }))
    return { q, page, pageSize }
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<PatientModel, any>[] = [
  {
    id: 'phn',
    header: 'PHN',
    cell: (cell) => (
      <Link to={`/patients/${cell.row.original.id}`} className="hover:underline">
        {cell.row.original.phn}
      </Link>
    )
  },
  {
    id: 'name',
    header: 'Name',
    cell: (cell) => cell.row.original.name
  },
  {
    id: 'age',
    header: 'Age',
    cell: (cell) => `${cell.row.original.age > 0 ? cell.row.original.age : '<1'}y`
  },
  {
    id: 'gender',
    header: 'Gender',
    cell: (cell) => cell.row.original.gender
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    cell: (cell) => cell.row.original.updated_at.toLocaleDateString()
  },
  {
    id: 'actions',
    cell: (cell) => {
      const patient = cell.row.original

      return (
        <DropdownMenu>
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
                navigator.clipboard.writeText(patient.phn)
                toast.success('PHN copied to clipboard')
              }}
            >
              Copy PHN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`/patients/${patient.id}`}>View Patient</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/patients/${patient.id}/edit`}>Edit Patient</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`/patients/${patient.id}/surgeries/add`}>Add Surgery</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export const PatientsIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(
    patientListQuery({
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
        onClick={() => navigate('/patients/add')}
      >
        Add New
      </Button>
    </div>
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
  }, [setBreadcrumbs])

  return (
    <AppLayout title="Patients" actions={actions}>
      <div className="mt-2 p-2 overflow-y-auto">
        <div className="flex pb-2">
          <Input
            type="text"
            placeholder="Search patients by PHN, BHT or Name..."
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
