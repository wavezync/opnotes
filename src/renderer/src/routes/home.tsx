import { useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Skeleton } from '@renderer/components/ui/skeleton'
import {
  Users,
  Stethoscope,
  UserCog,
  Plus,
  ArrowRight,
  Activity,
  Sun,
  Moon,
  CloudSun,
  ClipboardList
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@renderer/lib/utils'

// Helper to format relative time (e.g., "2h ago")
function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return format(date, 'MMM d')
}

// Greeting header with time-based icon
function GreetingHeader() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const Icon = hour < 12 ? Sun : hour < 17 ? CloudSun : Moon
  const iconColor = hour < 12 ? 'text-amber-500' : hour < 17 ? 'text-orange-500' : 'text-indigo-400'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={cn('h-7 w-7', iconColor)} />
        <span className="text-2xl font-semibold tracking-tight">{greeting}</span>
      </div>
      <span className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</span>
    </div>
  )
}

// Stats cards - individual cards for each metric
interface StatsCardsProps {
  stats: {
    totalPatients: number
    totalSurgeries: number
    totalDoctors: number
    patientsThisMonth: number
    surgeriesThisMonth: number
  } | null
  isLoading: boolean
}

function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const items = [
    {
      icon: Users,
      value: stats?.totalPatients ?? 0,
      label: 'Total Patients',
      change: stats?.patientsThisMonth || 0,
      changeLabel: 'this month'
    },
    {
      icon: Stethoscope,
      value: stats?.totalSurgeries ?? 0,
      label: 'Surgeries',
      change: stats?.surgeriesThisMonth || 0,
      changeLabel: 'this month'
    },
    {
      icon: UserCog,
      value: stats?.totalDoctors ?? 0,
      label: 'Doctors',
      change: null,
      changeLabel: 'registered'
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-bold tabular-nums tracking-tight">{item.value}</p>
                )}
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {item.change !== null ? (
                      <span className="text-emerald-500 font-medium">+{item.change}</span>
                    ) : null}
                    {item.change !== null ? ' ' : ''}
                    {item.changeLabel}
                  </p>
                )}
              </div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
          {/* Decorative gradient accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      ))}
    </div>
  )
}

// Hero CTA - Add Patient card
interface AddPatientCardProps {
  className?: string
}

function AddPatientCard({ className }: AddPatientCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/patients/add')}
      className={cn(
        'group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary/90 p-5 text-primary-foreground transition-all duration-300 hover:shadow-xl hover:shadow-primary/30',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div className="text-left">
          <div className="text-lg font-bold tracking-wide">Add Patient</div>
          <div className="text-sm opacity-80">Register a new patient</div>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 opacity-60 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
      </div>
    </button>
  )
}

// Navigation card
interface NavCardProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}

function NavCard({ to, icon: Icon, title, description, className }: NavCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className={cn(
        'group flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent hover:shadow-md',
        className
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-110">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </button>
  )
}

// Recent activity card with vertical scrollable list
interface RecentActivityItem {
  id: number
  entityType: 'patient' | 'surgery' | 'followup' | 'doctor'
  entityId: number
  action: 'created' | 'updated' | 'deleted'
  title: string
  description: string | null
  patientId: number | null
  surgeryId: number | null
  createdAt: string
}

interface RecentActivityCardProps {
  items: RecentActivityItem[]
  isLoading: boolean
  className?: string
}

function RecentActivityCard({ items, isLoading, className }: RecentActivityCardProps) {
  const navigate = useNavigate()

  const getTypeStyles = (entityType: RecentActivityItem['entityType'], action: RecentActivityItem['action']) => {
    const actionLabel = action === 'created' ? 'added' : action === 'updated' ? 'updated' : 'deleted'

    switch (entityType) {
      case 'patient':
        return {
          dot: 'bg-blue-500',
          icon: Users,
          label: `Patient ${actionLabel}`
        }
      case 'surgery':
        return {
          dot: 'bg-green-500',
          icon: Stethoscope,
          label: `Surgery ${actionLabel}`
        }
      case 'followup':
        return {
          dot: 'bg-amber-500',
          icon: ClipboardList,
          label: `Follow-up ${actionLabel}`
        }
      case 'doctor':
        return {
          dot: 'bg-purple-500',
          icon: UserCog,
          label: `Doctor ${actionLabel}`
        }
    }
  }

  const handleClick = (item: RecentActivityItem) => {
    if (item.surgeryId && item.patientId) {
      navigate(`/patients/${item.patientId}/surgeries/${item.surgeryId}`)
    } else if (item.patientId) {
      navigate(`/patients/${item.patientId}`)
    } else if (item.entityType === 'doctor') {
      navigate(`/doctors/${item.entityId}`)
    }
  }

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto min-h-0 pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <Activity className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => {
              const styles = getTypeStyles(item.entityType, item.action)
              return (
                <button
                  key={`${item.entityType}-${item.id}`}
                  onClick={() => handleClick(item)}
                  className="w-full flex items-start gap-3 p-2 rounded-lg text-left transition-colors hover:bg-accent group animate-stagger-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn('h-2 w-2 rounded-full mt-2 flex-shrink-0', styles.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {styles.label}
                      {item.description && ` · ${item.description}`}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    ...queries.dashboard.stats,
    refetchInterval: 30000
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    ...queries.dashboard.recentActivity(15)
  })

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      {/* Row 1: Greeting Header */}
      <GreetingHeader />

      {/* Row 2: Stats Cards */}
      <StatsCards stats={stats ?? null} isLoading={statsLoading} />

      {/* Row 3: Main Content Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
        {/* Left Column: Add Patient Hero + Nav Cards */}
        <div className="flex flex-col gap-4">
          {/* Hero CTA */}
          <AddPatientCard />

          {/* Quick Links - 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 content-start">
            <NavCard to="/patients" icon={Users} title="Patients" description="Browse all" />
            <NavCard to="/surgeries" icon={Stethoscope} title="Surgeries" description="View records" />
            <NavCard to="/doctors" icon={UserCog} title="Doctors" description="Manage list" />
            <NavCard to="/surgeries/add" icon={Plus} title="Add Surgery" description="New record" />
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <RecentActivityCard
          items={recentActivity || []}
          isLoading={activityLoading}
        />
      </div>
    </div>
  )
}
