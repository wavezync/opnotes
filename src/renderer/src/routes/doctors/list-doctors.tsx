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
import { Card, CardContent } from '@renderer/components/ui/card'
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
import { cn, unwrapResult } from '@renderer/lib/utils'
import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSearch,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCog
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { DoctorModel } from 'src/shared/models/DoctorModel'
import { DoctorFilter } from 'src/shared/types/api'

type SortBy = NonNullable<DoctorFilter['sortBy']>
type SortOrder = NonNullable<DoctorFilter['sortOrder']>

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'designation', label: 'Designation' }
]

const doctorListQuery = (filter: DoctorFilter) =>
  queryOptions({
    ...queries.doctors.list(filter),
    placeholderData: keepPreviousData
  })

// Doctor initials avatar
function DoctorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
        'bg-violet-500/15 text-violet-600'
      )}
    >
      {initials}
    </div>
  )
}

// Designation badge
function DesignationBadge({ designation }: { designation: string | null }) {
  if (!designation) return null
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent text-muted-foreground">
      {designation}
    </span>
  )
}

// Delete confirmation dialog
function DeleteDoctorDialog({
  doctor,
  onDelete
}: {
  doctor: DoctorModel
  onDelete: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{doctor.name}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Doctor row component
function DoctorRow({
  doctor,
  onNavigate,
  onDelete
}: {
  doctor: DoctorModel
  onNavigate: (path: string) => void
  onDelete: () => void
}) {
  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
      onClick={() => onNavigate(`/doctors/${doctor.id}/edit`)}
    >
      <DoctorAvatar name={doctor.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">{doctor.name}</span>
          <DesignationBadge designation={doctor.designation} />
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Medical Professional</span>
        </div>
      </div>

      <div className="text-right text-sm text-muted-foreground hidden sm:block">
        <div className="text-xs uppercase tracking-wide opacity-60">Updated</div>
        <div>{doctor.updated_at.toLocaleDateString()}</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(`/doctors/${doctor.id}/edit`)
          }}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <DeleteDoctorDialog doctor={doctor} onDelete={onDelete} />
      </div>
    </div>
  )
}

// Loading skeleton for doctor row
function DoctorRowSkeleton() {
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
      <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {search
          ? `No results for "${search}". Try adjusting your search terms.`
          : 'Get started by adding your first doctor to the system.'}
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
        <span className="font-medium text-foreground">{total}</span> doctors
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

export const DoctorsIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data, isLoading } = useQuery(
    doctorListQuery({
      search,
      page,
      pageSize,
      sortBy,
      sortOrder
    })
  )

  const deleteDoctorMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(window.api.invoke('deleteDoctorById', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(queries.doctors.list({}))
      toast.success('Doctor deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete doctor. This doctor may have associated records.')
    }
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }])
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
          <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <UserCog className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} doctors registered</p>
          </div>
        </div>
        <Button onClick={() => navigate('/doctors/add')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
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
                placeholder="Search by doctor name..."
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

      {/* Doctor List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <DoctorRowSkeleton key={i} />
            ))}
          </>
        ) : data?.data.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          data?.data.map((doctor) => (
            <DoctorRow
              key={doctor.id}
              doctor={doctor}
              onNavigate={navigate}
              onDelete={() => deleteDoctorMutation.mutate(doctor.id)}
            />
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
