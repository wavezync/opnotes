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
import { cn } from '@renderer/lib/utils'
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  FileSearch,
  RefreshCw,
  ScrollText,
  Search,
  Stethoscope,
  UserCog,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityLogFilter } from 'src/shared/types/api'
import { ActivityLogItem } from 'src/main/repository/activity'

type EntityType = NonNullable<ActivityLogFilter['entityType']>
type ActionType = NonNullable<ActivityLogFilter['action']>

const ENTITY_OPTIONS: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Entities' },
  { value: 'patient', label: 'Patient' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'doctor', label: 'Doctor' }
]

const ACTION_OPTIONS: { value: ActionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' }
]

const activityListQuery = (filter: ActivityLogFilter) =>
  queryOptions({
    ...queries.activityLog.list(filter),
    placeholderData: keepPreviousData
  })

// Entity type icon component
function EntityIcon({ entityType }: { entityType: EntityType }) {
  const iconConfig = {
    patient: { icon: Users, bgColor: 'bg-blue-500/15', textColor: 'text-blue-600' },
    surgery: { icon: Stethoscope, bgColor: 'bg-emerald-500/15', textColor: 'text-emerald-600' },
    followup: { icon: RefreshCw, bgColor: 'bg-amber-500/15', textColor: 'text-amber-600' },
    doctor: { icon: UserCog, bgColor: 'bg-violet-500/15', textColor: 'text-violet-600' }
  }

  const config = iconConfig[entityType]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
        config.bgColor
      )}
    >
      <Icon className={cn('h-5 w-5', config.textColor)} />
    </div>
  )
}

// Action badge component
function ActionBadge({ action }: { action: ActionType }) {
  const badgeConfig = {
    created: { label: 'Created', className: 'bg-emerald-500/10 text-emerald-600' },
    updated: { label: 'Updated', className: 'bg-blue-500/10 text-blue-600' },
    deleted: { label: 'Deleted', className: 'bg-red-500/10 text-red-600' }
  }

  const config = badgeConfig[action]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

// Entity type badge component
function EntityBadge({ entityType }: { entityType: EntityType }) {
  const badgeConfig = {
    patient: { label: 'Patient', className: 'bg-blue-500/10 text-blue-600' },
    surgery: { label: 'Surgery', className: 'bg-emerald-500/10 text-emerald-600' },
    followup: { label: 'Follow-up', className: 'bg-amber-500/10 text-amber-600' },
    doctor: { label: 'Doctor', className: 'bg-violet-500/10 text-violet-600' }
  }

  const config = badgeConfig[entityType]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}

// Activity row component
function ActivityRow({
  activity,
  onNavigate
}: {
  activity: ActivityLogItem
  onNavigate: (path: string) => void
}) {
  const handleClick = () => {
    // Navigate based on entity type
    if (activity.entityType === 'patient' && activity.patientId) {
      onNavigate(`/patients/${activity.patientId}`)
    } else if (activity.entityType === 'surgery' && activity.patientId && activity.surgeryId) {
      onNavigate(`/patients/${activity.patientId}/surgeries/${activity.surgeryId}`)
    } else if (activity.entityType === 'followup' && activity.patientId && activity.surgeryId) {
      onNavigate(`/patients/${activity.patientId}/surgeries/${activity.surgeryId}`)
    } else if (activity.entityType === 'doctor') {
      onNavigate(`/doctors/${activity.entityId}/edit`)
    }
  }

  const formattedDate = new Date(activity.createdAt).toLocaleDateString()
  const formattedTime = new Date(activity.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/20 cursor-pointer"
      onClick={handleClick}
    >
      <EntityIcon entityType={activity.entityType} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground truncate">{activity.title}</span>
          <ActionBadge action={activity.action} />
          <EntityBadge entityType={activity.entityType} />
        </div>
        {activity.description && (
          <p className="mt-0.5 text-sm text-muted-foreground truncate">{activity.description}</p>
        )}
      </div>

      <div className="text-right text-sm text-muted-foreground hidden sm:block">
        <div className="text-xs uppercase tracking-wide opacity-60">When</div>
        <div>{formattedDate}</div>
        <div className="text-xs opacity-60">{formattedTime}</div>
      </div>
    </div>
  )
}

// Loading skeleton for activity row
function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-48 mb-2" />
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
      <h3 className="text-lg font-semibold mb-2">No activity found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {search
          ? `No results for "${search}". Try adjusting your search or filters.`
          : 'No activity has been recorded yet. Activity will appear here as you create and modify records.'}
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
        <span className="font-medium text-foreground">{total}</span> activities
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

export const ActivityIndex = () => {
  const { setBreadcrumbs } = useBreadcrumbs()
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<EntityType | 'all'>('all')
  const [action, setAction] = useState<ActionType | 'all'>('all')

  const filter: ActivityLogFilter = {
    search: search || undefined,
    entityType: entityType === 'all' ? undefined : entityType,
    action: action === 'all' ? undefined : action,
    page,
    pageSize
  }

  const { data, isLoading } = useQuery(activityListQuery(filter))

  useEffect(() => {
    setBreadcrumbs([{ label: 'Activity', to: '/activity' }])
  }, [setBreadcrumbs])

  const handleFilterChange = <T extends string>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <ScrollText className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
            <p className="text-sm text-muted-foreground">
              {data?.total ?? 0} activities recorded
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search activities..."
                className="pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 border-l pl-3">
              <Select
                value={entityType}
                onValueChange={handleFilterChange<EntityType | 'all'>(setEntityType)}
              >
                <SelectTrigger className="w-[130px] h-9 border-0 bg-accent/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={action}
                onValueChange={handleFilterChange<ActionType | 'all'>(setAction)}
              >
                <SelectTrigger className="w-[120px] h-9 border-0 bg-accent/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <ActivityRowSkeleton key={i} />
            ))}
          </>
        ) : data?.data.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          data?.data.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} onNavigate={navigate} />
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
