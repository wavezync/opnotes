import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Input } from '@renderer/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { queries } from '@renderer/lib/queries'
import { cn } from '@renderer/lib/utils'
import { QueryClient, keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  Eye,
  FileSearch,
  MoreVertical,
  Plus,
  Scissors,
  Search,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoaderFunctionArgs, useNavigate, useSearchParams } from 'react-router-dom'
import { PatientModel } from 'src/shared/models/PatientModel'
import { PatientFilter } from 'src/shared/types/api'

type SortBy = NonNullable<PatientFilter['sortBy']>
type SortOrder = NonNullable<PatientFilter['sortOrder']>

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'phn', label: 'PHN' },
  { value: 'age', label: 'Age' }
]

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

// Patient initials avatar
function PatientAvatar({ name, gender }: { name: string; gender: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const bgColor = gender === 'M' ? 'bg-blue-500/15 text-blue-600' : 'bg-rose-500/15 text-rose-600'

  return (
    <div
      className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
        bgColor
      )}
    >
      {initials}
    </div>
  )
}

// Gender badge
function GenderBadge({ gender }: { gender: string }) {
  const isMale = gender === 'M'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        isMale ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'
      )}
    >
      {isMale ? 'Male' : 'Female'}
    </span>
  )
}

// Patient row component
function PatientRow({
  patient,
  onNavigate
}: {
  patient: PatientModel
  onNavigate: (path: string) => void
}) {
  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
      onClick={() => onNavigate(`/patients/${patient.id}`)}
    >
      <PatientAvatar name={patient.name} gender={patient.gender} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">{patient.name}</span>
          <GenderBadge gender={patient.gender} />
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
          <span className="font-mono">{patient.phn}</span>
          <span className="text-border">|</span>
          <span>{patient.age > 0 ? `${patient.age} years` : '<1 year'}</span>
        </div>
      </div>

      <div className="text-right text-sm text-muted-foreground hidden sm:block">
        <div className="text-xs uppercase tracking-wide opacity-60">Updated</div>
        <div>{patient.updated_at.toLocaleDateString()}</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              navigator.clipboard.writeText(patient.phn)
              toast.success('PHN copied to clipboard')
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy PHN
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(`/patients/${patient.id}`)
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Patient
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(`/patients/${patient.id}/edit`)
            }}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Patient
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onNavigate(`/patients/${patient.id}/surgeries/add`)
            }}
          >
            <Scissors className="h-4 w-4 mr-2" />
            Add Surgery
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Loading skeleton for patient row
function PatientRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

// Empty state
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <FileSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No patients found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {search
          ? `No results for "${search}". Try adjusting your search terms.`
          : 'Get started by adding your first patient to the system.'}
      </p>
    </div>
  )
}

// Pagination controls
function Pagination({
  page,
  pageSize,
  total,
  onPageChange
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, total)

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span> to{' '}
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span> patients
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export const PatientsIndex = () => {
  const [searchParams] = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<SortBy>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data, isLoading } = useQuery(
    patientListQuery({
      search,
      page,
      pageSize,
      sortBy,
      sortOrder
    })
  )

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
  }, [setBreadcrumbs])

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    setPage(0)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} patients registered</p>
          </div>
        </div>
        <Button onClick={() => navigate('/patients/add')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Search & Sort Bar */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by PHN, BHT, or patient name..."
                className="pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 border-l pl-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by</span>
              <Select
                value={sortBy}
                onValueChange={(value: SortBy) => {
                  setSortBy(value)
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-[140px] h-9 border-0 bg-accent/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={toggleSortOrder}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUpAZ className="h-4 w-4" />
                ) : (
                  <ArrowDownAZ className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <PatientRowSkeleton key={i} />
            ))}
          </>
        ) : data?.data.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          data?.data.map((patient) => (
            <PatientRow key={patient.id} patient={patient} onNavigate={navigate} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && data && data.total > 0 && (
        <Pagination page={page} pageSize={pageSize} total={data.total} onPageChange={setPage} />
      )}
    </div>
  )
}
