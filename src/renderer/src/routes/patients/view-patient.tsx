import { Button } from '@renderer/components/ui/button'
import { DetailLayout, PageHeader } from '@renderer/components/layouts'
import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { QueryClient, queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  EditIcon,
  MoreHorizontal,
  PlusSquare,
  Phone,
  PhoneCall,
  UserPlus,
  FileText,
  Stethoscope,
  Search,
  Copy,
  Eye,
  Edit,
  Calendar,
  Hash,
  User,
  Building2,
  Cake,
  HeartPulse,
  Droplets,
  AlertTriangle,
  ClipboardList,
  Pill
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom'
import { PatientModel } from 'src/shared/models/PatientModel'
import { getPatientByIdQuery } from './edit-patient'
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
import { toast } from '@renderer/components/ui/sonner'
import { SurgeryFilter } from 'src/shared/types/api'
import { Input } from '@renderer/components/ui/input'
import { cn, formatDate, formatDateTime } from '@renderer/lib/utils'
import womenIcon from '../../../../../resources/woman.png?asset'
import manIcon from '../../../../../resources/man.png?asset'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@renderer/components/ui/accordion'

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { id } = params as { id: string }
    await queryClient.ensureQueryData(getPatientByIdQuery(parseInt(id)))
    return { id }
  }

const surgeryListQuery = (filter: SurgeryFilter) =>
  queryOptions({ ...queries.surgeries.list(filter) })

// ============================================================
// PatientSidebar - Comprehensive patient info card
// ============================================================
interface PatientSidebarProps {
  patient: PatientModel
  onEdit: () => void
}

// Helper to parse comma-separated tags
const parseTags = (str: string | null): string[] => {
  return str ? str.split(',').filter((tag) => tag.trim()) : []
}

const PatientSidebar = ({ patient, onEdit }: PatientSidebarProps) => {
  const genderColor = patient.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
  const hasRemarks = !!patient.remarks

  // Parse medical history fields
  const allergies = parseTags(patient.allergies)
  const conditions = parseTags(patient.conditions)
  const medications = parseTags(patient.medications)
  const hasMedicalHistory = patient.blood_group || allergies.length > 0 || conditions.length > 0 || medications.length > 0

  // Demographics items
  const demographicItems = [
    {
      icon: Hash,
      label: 'PHN',
      value: patient.phn,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      mono: true
    },
    {
      icon: Cake,
      label: 'Age',
      value: `${patient.age > 1 ? patient.age : '<1'} years`,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      icon: User,
      label: 'Gender',
      value: patient.gender === 'M' ? 'Male' : 'Female',
      iconBg: patient.gender === 'M' ? 'bg-blue-500/10' : 'bg-pink-500/10',
      iconColor: patient.gender === 'M' ? 'text-blue-500' : 'text-pink-500'
    },
    {
      icon: Building2,
      label: 'Ward',
      value: patient.ward || 'Not assigned',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500'
    }
  ]

  // Contact items (only if they exist)
  const contactItems = [
    patient.phone && {
      icon: Phone,
      label: 'Phone',
      value: patient.phone,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    patient.emergency_contact && {
      icon: UserPlus,
      label: 'Emergency Contact',
      value: patient.emergency_contact,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500'
    },
    patient.emergency_phone && {
      icon: PhoneCall,
      label: 'Emergency Phone',
      value: patient.emergency_phone,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500'
    }
  ].filter(Boolean) as {
    icon: typeof Phone
    label: string
    value: string
    iconBg: string
    iconColor: string
  }[]

  const hasContactInfo = contactItems.length > 0

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 overflow-hidden">
      {/* Header with avatar */}
      <div className="relative px-4 pt-4 pb-3">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

        <div className="relative flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent/50 p-0.5 shadow-theme-sm">
              <div className="h-full w-full rounded-lg bg-card flex items-center justify-center overflow-hidden">
                <img
                  src={patient.gender === 'M' ? manIcon : womenIcon}
                  alt="Patient"
                  className="w-8 h-8"
                />
              </div>
            </div>
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded flex items-center justify-center text-white text-[8px] font-bold shadow-sm',
                genderColor
              )}
            >
              {patient.gender}
            </div>
          </div>

          {/* Name and edit */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{patient.name || 'Unknown'}</h3>
            <p className="text-xs text-muted-foreground font-mono">{patient.phn}</p>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit}>
            <EditIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Demographics */}
      <CardContent className="px-4 py-3 space-y-2 border-t">
        {demographicItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div className={cn('h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0', item.iconBg)}>
              <item.icon className={cn('h-3.5 w-3.5', item.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{item.label}</p>
              <p className={cn('text-sm font-medium truncate', item.mono && 'font-mono')}>{item.value}</p>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Contact info */}
      {hasContactInfo && (
        <CardContent className="px-4 py-3 space-y-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
          {contactItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <div className={cn('h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0', item.iconBg)}>
                <item.icon className={cn('h-3.5 w-3.5', item.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{item.label}</p>
                <p className="text-sm font-medium truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      )}

      {/* Medical History */}
      {hasMedicalHistory && (
        <div className="border-t">
          <Accordion type="single" collapsible defaultValue="medical-history">
            <AccordionItem value="medical-history" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-rose-500/10 flex items-center justify-center">
                    <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  <span className="text-sm font-medium">Medical History</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-3 space-y-3">
                  {/* Blood Group */}
                  {patient.blood_group && (
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Droplets className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Blood Group</p>
                        <p className="text-sm font-medium">{patient.blood_group}</p>
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {allergies.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Allergies</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-8">
                        {allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pre-existing Conditions */}
                  {conditions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="h-3 w-3 text-violet-500" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Conditions</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-8">
                        {conditions.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Medications */}
                  {medications.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Pill className="h-3 w-3 text-emerald-500" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Medications</p>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-8">
                        {medications.map((medication) => (
                          <Badge key={medication} variant="outline" className="text-xs">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Remarks */}
      {hasRemarks && (
        <div className="border-t">
          <Accordion type="single" collapsible defaultValue="remarks">
            <AccordionItem value="remarks" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium">Remarks</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 pb-3">
                  <div className="p-3 rounded-lg bg-accent/30">
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: patient.remarks! }}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Card>
  )
}

// ============================================================
// Enhanced surgery table columns
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const surgeryColumns: ColumnDef<Surgery, any>[] = [
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
        {cell.row.original.title}
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
        <span>{cell.row.original.date !== null ? formatDate(cell.row.original.date) : 'N/A'}</span>
      </div>
    )
  },
  {
    id: 'updatedAt',
    header: 'Updated',
    cell: (cell) => (
      <span className="text-sm text-muted-foreground">{formatDateTime(cell.row.original.updated_at)}</span>
    )
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
// PatientSurgeriesCard - Surgeries list with search
// ============================================================
interface PatientSurgeriesCardProps {
  patientId: number
  onAddSurgery: () => void
}

const PatientSurgeriesCard = ({ patientId, onAddSurgery }: PatientSurgeriesCardProps) => {
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

  const totalRecords = data?.total ?? 0

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
          <Button variant="gradient" size="sm" leftIcon={<PlusSquare className="h-4 w-4" />} onClick={onAddSurgery}>
            Add Surgery
          </Button>
        </div>
        {/* Search input */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by BHT, Title..."
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
            <h3 className="font-semibold mb-1">No surgeries yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              This patient does not have any surgery records.
            </p>
            <Button variant="gradient" size="sm" leftIcon={<PlusSquare className="h-4 w-4" />} onClick={onAddSurgery}>
              Add First Surgery
            </Button>
          </div>
        ) : (
          <DataTable
            columns={surgeryColumns}
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
// Main ViewPatient Component
// ============================================================
export const ViewPatient = () => {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { id } = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>
  const { data: patient } = useSuspenseQuery(getPatientByIdQuery(parseInt(id)))

  useEffect(() => {
    setBreadcrumbs([{ label: 'Patients', to: '/patients' }])
  }, [setBreadcrumbs])

  const handleAddSurgery = () => navigate(`/patients/${id}/surgeries/add`)
  const handleEdit = () => navigate(`/patients/${id}/edit`)

  return (
    <DetailLayout
      header={
        <PageHeader
          icon={User}
          iconColor="emerald"
          title={patient?.name || 'Patient'}
          subtitle={<span className="font-mono">{patient?.phn}</span>}
          showBackButton
          actions={
            <Button variant="gradient" leftIcon={<Edit className="h-4 w-4" />} onClick={handleEdit}>
              Edit Patient
            </Button>
          }
        />
      }
      sidebar={<PatientSidebar patient={patient!} onEdit={handleEdit} />}
    >
      <PatientSurgeriesCard patientId={parseInt(id)} onAddSurgery={handleAddSurgery} />
    </DetailLayout>
  )
}
