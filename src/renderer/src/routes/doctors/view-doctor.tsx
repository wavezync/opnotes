import { Button } from '@renderer/components/ui/button'
import { DetailLayout, PageHeader } from '@renderer/components/layouts'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { QueryClient, queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  EditIcon,
  MoreHorizontal,
  Search,
  Copy,
  Eye,
  Edit,
  Calendar,
  UserCog,
  Stethoscope,
  Award,
  Briefcase,
  User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom'
import { queries } from '@renderer/lib/queries'
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
import { toast } from '@renderer/components/ui/sonner'
import { DoctorSurgeryFilter } from 'src/shared/types/api'
import { Input } from '@renderer/components/ui/input'
import { cn, formatDate, formatDateTime } from '@renderer/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { DoctorModel } from 'src/shared/models/DoctorModel'
import { DoctorSurgeryResult } from 'src/main/repository/surgery'

export const getDoctorByIdQuery = (id: number) =>
  queryOptions({
    ...queries.doctors.get(id)
  })

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { id } = params as { id: string }
    await queryClient.ensureQueryData(getDoctorByIdQuery(parseInt(id)))
    return { id }
  }

const doctorSurgeryListQuery = (doctorId: number, filter: DoctorSurgeryFilter) =>
  queryOptions({ ...queries.doctors.surgeries(doctorId, filter) })

// ============================================================
// DoctorSidebar - Comprehensive doctor info card
// ============================================================
interface DoctorSidebarProps {
  doctor: DoctorModel
  onEdit: () => void
}

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
        'h-12 w-12 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0',
        'bg-violet-500/15 text-violet-600'
      )}
    >
      {initials}
    </div>
  )
}

const DoctorSidebar = ({ doctor, onEdit }: DoctorSidebarProps) => {
  const infoItems = [
    {
      icon: Award,
      label: 'SLMC Registration',
      value: doctor.slmc_reg_no || 'Not provided',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      mono: true
    },
    {
      icon: Briefcase,
      label: 'Designation',
      value: doctor.designation || 'Not specified',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      icon: Calendar,
      label: 'Added On',
      value: formatDate(doctor.created_at),
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      icon: Calendar,
      label: 'Last Updated',
      value: formatDateTime(doctor.updated_at),
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500'
    }
  ]

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 overflow-hidden">
      {/* Header with avatar */}
      <div className="relative px-4 pt-4 pb-3">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />

        <div className="relative flex items-center gap-3">
          {/* Avatar */}
          <DoctorAvatar name={doctor.name} />

          {/* Name and edit */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{doctor.name || 'Unknown'}</h3>
            {doctor.designation && (
              <p className="text-xs text-muted-foreground">{doctor.designation}</p>
            )}
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}>
            <EditIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Doctor Info */}
      <CardContent className="px-4 py-3 space-y-2 border-t">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0',
                item.iconBg
              )}
            >
              <item.icon className={cn('h-3.5 w-3.5', item.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{item.label}</p>
              <p className={cn('text-sm font-medium truncate', item.mono && 'font-mono')}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Surgery table columns for doctor view
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doctorSurgeryColumns: ColumnDef<DoctorSurgeryResult, any>[] = [
  {
    id: 'bht',
    header: 'BHT',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}/surgeries/${cell.row.original.id}`}
        className="font-mono text-primary hover:text-primary/80 hover:underline transition-colors"
      >
        {cell.row.original.bht}
      </Link>
    )
  },
  {
    id: 'title',
    header: 'Procedure',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}/surgeries/${cell.row.original.id}`}
        className="hover:text-primary truncate max-w-[200px] block transition-colors"
      >
        {cell.row.original.title || '—'}
      </Link>
    )
  },
  {
    id: 'patient',
    header: 'Patient',
    cell: (cell) => (
      <Link
        to={`/patients/${cell.row.original.patient_id}`}
        className="flex items-center gap-1.5 hover:text-primary transition-colors"
      >
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate max-w-[120px]">{cell.row.original.patient_name || '—'}</span>
      </Link>
    )
  },
  {
    id: 'ward',
    header: 'Ward',
    cell: (cell) =>
      cell.row.original.ward ? (
        <Badge variant="outline" className="font-normal">
          {cell.row.original.ward}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
  },
  {
    id: 'date',
    header: 'Surgery Date',
    cell: (cell) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>
          {cell.row.original.date !== null ? formatDate(new Date(cell.row.original.date)) : 'N/A'}
        </span>
      </div>
    )
  },
  {
    id: 'role',
    header: 'Role',
    cell: (cell) => {
      const role = cell.row.original.role
      return (
        <Badge
          variant="secondary"
          className={cn(
            'font-normal',
            role === 'done_by'
              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
              : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
          )}
        >
          {role === 'done_by' ? 'Surgeon' : 'Assistant'}
        </Badge>
      )
    }
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
              <Copy className="h-4 w-4 mr-2" />
              Copy BHT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/patients/${record.patient_id}/surgeries/${record.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Surgery
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/patients/${record.patient_id}/surgeries/${record.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Surgery
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

// ============================================================
// DoctorSurgeriesCard - Surgeries list with search and role filter
// ============================================================
interface DoctorSurgeriesCardProps {
  doctorId: number
}

type RoleFilter = 'all' | 'done_by' | 'assisted_by'

const DoctorSurgeriesCard = ({ doctorId }: DoctorSurgeriesCardProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const { data, isLoading } = useQuery(
    doctorSurgeryListQuery(doctorId, {
      search,
      role: roleFilter,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  )

  const totalRecords = data?.total ?? 0

  const handleRoleChange = (value: string) => {
    setRoleFilter(value as RoleFilter)
    setPagination({ ...pagination, pageIndex: 0 })
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 flex flex-col h-full">
      <CardHeader className="py-3 px-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            Surgeries
            <Badge variant="secondary" className="ml-1 text-xs">
              {totalRecords}
            </Badge>
          </CardTitle>
          {/* Role filter tabs */}
          <Tabs value={roleFilter} onValueChange={handleRoleChange}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-6">
                All
              </TabsTrigger>
              <TabsTrigger value="done_by" className="text-xs px-3 h-6">
                Surgeon
              </TabsTrigger>
              <TabsTrigger value="assisted_by" className="text-xs px-3 h-6">
                Assistant
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Search input */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by BHT, Procedure, Patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-0">
        {!isLoading && totalRecords === 0 && !search ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Stethoscope className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold mb-1">No surgeries found</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              {roleFilter === 'all'
                ? 'This doctor has not been involved in any surgeries yet.'
                : roleFilter === 'done_by'
                  ? 'This doctor has not performed any surgeries as a surgeon.'
                  : 'This doctor has not assisted in any surgeries.'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={doctorSurgeryColumns}
            data={data?.data || []}
            rowCount={data?.total}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main ViewDoctor Component
// ============================================================
export const ViewDoctor = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { id } = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>
  const { data: doctor } = useSuspenseQuery(getDoctorByIdQuery(parseInt(id)))

  useEffect(() => {
    setBreadcrumbs([{ label: 'Doctors', to: '/doctors' }])
  }, [setBreadcrumbs])

  const handleEdit = () => navigate(`/doctors/${id}/edit`)

  return (
    <DetailLayout
      header={
        <PageHeader
          icon={UserCog}
          iconColor="violet"
          title={doctor?.name || 'Doctor'}
          subtitle={doctor?.designation || 'Medical Professional'}
          showBackButton
          actions={
            <Button variant="gradient" leftIcon={<Edit className="h-4 w-4" />} onClick={handleEdit}>
              Edit Doctor
            </Button>
          }
        />
      }
      sidebar={<DoctorSidebar doctor={doctor!} onEdit={handleEdit} />}
    >
      <DoctorSurgeriesCard doctorId={parseInt(id)} />
    </DetailLayout>
  )
}
