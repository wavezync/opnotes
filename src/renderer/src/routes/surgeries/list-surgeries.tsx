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
import { SurgeryModel } from '@shared/models/SurgeryModel'
import { SurgeryFilter } from '@shared/types/api'
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSearch,
  Plus,
  Search,
  Stethoscope,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

type SortBy = NonNullable<SurgeryFilter['sortBy']>
type SortOrder = NonNullable<SurgeryFilter['sortOrder']>

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date', label: 'Surgery Date' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'created_at', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'bht', label: 'BHT' },
  { value: 'ward', label: 'Ward' }
]

const surgeryListQuery = (filter: SurgeryFilter) =>
  queryOptions({
    ...queries.surgeries.list(filter),
    placeholderData: keepPreviousData
  })

// Surgery icon with color based on ward or type
function SurgeryIcon() {
  return (
    <div
      className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
        'bg-emerald-500/15 text-emerald-600'
      )}
    >
      <Stethoscope className="h-5 w-5" />
    </div>
  )
}

// Ward badge
function WardBadge({ ward }: { ward: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-accent text-muted-foreground">
      {ward}
    </span>
  )
}

// Date badge
function DateBadge({ date }: { date: Date | null }) {
  if (!date) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Calendar className="h-3 w-3" />
      {date.toLocaleDateString()}
    </span>
  )
}

// Delete confirmation dialog
function DeleteSurgeryDialog({
  surgery,
  onDelete
}: {
  surgery: SurgeryModel
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
          <AlertDialogTitle>Delete Surgery</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete surgery <strong>{surgery.title || surgery.bht}</strong>?
            This will also delete all follow-up records. This action cannot be undone.
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

// Surgery row component
function SurgeryRow({
  surgery,
  onNavigate,
  onDelete
}: {
  surgery: SurgeryModel
  onNavigate: (path: string) => void
  onDelete: () => void
}) {
  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
      onClick={() => onNavigate(`/patients/${surgery.patient_id}/surgeries/${surgery.id}`)}
    >
      <SurgeryIcon />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground truncate">
            {surgery.title || 'Untitled Surgery'}
          </span>
          <WardBadge ward={surgery.ward} />
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
          <span className="font-mono">{surgery.bht}</span>
          <span className="text-border">|</span>
          <DateBadge date={surgery.date} />
        </div>
      </div>

      <div className="text-right text-sm text-muted-foreground hidden sm:block">
        <div className="text-xs uppercase tracking-wide opacity-60">Updated</div>
        <div>{surgery.updated_at.toLocaleDateString()}</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(`/patients/${surgery.patient_id}/surgeries/${surgery.id}/edit`)
          }}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <DeleteSurgeryDialog surgery={surgery} onDelete={onDelete} />
      </div>
    </div>
  )
}

// Loading skeleton for surgery row
function SurgeryRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
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
      <h3 className="text-lg font-semibold mb-2">No surgeries found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {search
          ? `No results for "${search}". Try adjusting your search terms.`
          : 'No surgery records yet. Add a surgery from a patient profile.'}
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
        <span className="font-medium text-foreground">{total}</span> surgeries
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

export const SurgierisIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data, isLoading } = useQuery(
    surgeryListQuery({
      search,
      page,
      pageSize,
      sortBy,
      sortOrder
    })
  )

  const deleteSurgeryMutation = useMutation({
    mutationFn: (id: number) => unwrapResult(window.api.invoke('deleteSurgeryById', id)),
    onSuccess: () => {
      queryClient.invalidateQueries(queries.surgeries.list({}))
      toast.success('Surgery deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete surgery. Please try again.')
    }
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Surgeries', to: '/surgeries' }])
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
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Surgeries</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} surgery records</p>
          </div>
        </div>
        <Button onClick={() => navigate('/quick-surgery')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Surgery
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
                placeholder="Search by BHT, title, or patient name..."
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

      {/* Surgery List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <SurgeryRowSkeleton key={i} />
            ))}
          </>
        ) : data?.data.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          data?.data.map((surgery) => (
            <SurgeryRow
              key={surgery.id}
              surgery={surgery}
              onNavigate={navigate}
              onDelete={() => deleteSurgeryMutation.mutate(surgery.id)}
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
