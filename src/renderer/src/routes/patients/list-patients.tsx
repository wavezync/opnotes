import { Breadcrumbs } from '@renderer/components/common/Breadcrumbs'
import { SectionTitle } from '@renderer/components/common/SectionHeader'
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
import { queries } from '@renderer/lib/queries'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import { ColumnDef, PaginationState } from '@tanstack/react-table'
import { MoreHorizontal, PlusSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { PatientModel } from 'src/shared/models/PatientModel'
import { PatientFilter } from 'src/shared/types/api'

const patientListQuery = (filter: PatientFilter) =>
  queryOptions({
    ...queries.patients.list(filter),
    placeholderData: keepPreviousData
  })

const columns: ColumnDef<PatientModel, any>[] = [
  {
    id: 'phn',
    header: 'PHN',
    cell: (cell) => cell.row.original.phn
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
              <Link to={`/patients/${patient.id}/surgery/add`}>Add Surgery</Link>
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
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery(
    patientListQuery({
      search,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  )
  console.log(pagination)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
  }, [setBreadcrumbs])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center relative flex md:items-center md:justify-center mb-2">
        <div className="absolute left-0">
          <Breadcrumbs />
        </div>

        <SectionTitle title="Patients" />

        <div className="absolute right-1 space-x-1">
          <Button
            variant="default"
            leftIcon={<PlusSquare />}
            onClick={() => navigate('/patients/add')}
          >
            Add New
          </Button>
        </div>
      </div>

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
    </div>
  )
}
