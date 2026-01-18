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
    <div className="flex items-center justify-between animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/50">
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
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
      changeLabel: 'this month',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Stethoscope,
      value: stats?.totalSurgeries ?? 0,
      label: 'Surgeries',
      change: stats?.surgeriesThisMonth || 0,
      changeLabel: 'this month',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: UserCog,
      value: stats?.totalDoctors ?? 0,
      label: 'Doctors',
      change: null,
      changeLabel: 'registered',
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => (
        <Card
          key={i}
          className={cn(
            'relative overflow-hidden hover-lift animate-fade-in-up',
            'bg-gradient-to-br from-card to-card/80'
          )}
          style={{ animationDelay: `${(i + 1) * 75}ms` }}
        >
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
              <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', item.bgColor)}>
                <item.icon className={cn('h-5 w-5', item.color)} />
              </div>
            </div>
          </CardContent>
          {/* Decorative gradient accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      ))}
    </div>
  )
}

// Hero CTA - Quick Add Surgery card
interface QuickAddSurgeryCardProps {
  className?: string
}

function QuickAddSurgeryCard({ className }: QuickAddSurgeryCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/quick-surgery')}
      className={cn(
        'group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white transition-all duration-300 hover:shadow-theme-lg hover:scale-[1.01] animate-fade-in-up',
        className
      )}
      style={{ animationDelay: '200ms' }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-shine animate-shimmer opacity-30" />

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/30">
          <div className="relative">
            <Stethoscope className="h-6 w-6" strokeWidth={2} />
            <Plus className="h-3 w-3 absolute -bottom-0.5 -right-1 bg-white/30 rounded-full p-0.5" strokeWidth={3} />
          </div>
        </div>
        <div className="text-left">
          <div className="text-lg font-bold tracking-wide">Quick Add Surgery</div>
          <div className="text-sm opacity-80">Record a new surgery</div>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
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
  index?: number
}

function NavCard({ to, icon: Icon, title, description, className, index = 0 }: NavCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className={cn(
        'group flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 hover:shadow-theme-md animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${(index + 3) * 75}ms` }}
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
          dot: 'bg-emerald-500',
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
          dot: 'bg-violet-500',
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
    <Card className={cn('flex flex-col overflow-hidden animate-slide-in-right', className)} style={{ animationDelay: '150ms' }}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
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
                  className="w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all duration-200 hover:bg-accent group animate-fade-in-up"
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <div className={cn('h-2 w-2 rounded-full mt-2 flex-shrink-0 transition-transform group-hover:scale-125', styles.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {styles.label}
                      {item.description && ` · ${item.description}`}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 tabular-nums">
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
      {/* Subtle radial gradient background */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none -z-10" />

      {/* Row 1: Greeting Header */}
      <GreetingHeader />

      {/* Row 2: Stats Cards */}
      <StatsCards stats={stats ?? null} isLoading={statsLoading} />

      {/* Row 3: Main Content Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
        {/* Left Column: Quick Add Surgery Hero + Nav Cards */}
        <div className="flex flex-col gap-4">
          {/* Hero CTA */}
          <QuickAddSurgeryCard />

          {/* Quick Links - 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 content-start">
            <NavCard to="/patients" icon={Users} title="Patients" description="Browse all" index={0} />
            <NavCard to="/surgeries" icon={Stethoscope} title="Surgeries" description="View records" index={1} />
            <NavCard to="/doctors" icon={UserCog} title="Doctors" description="Manage list" index={2} />
            <NavCard to="/patients/add" icon={Plus} title="Add Patient" description="New record" index={3} />
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
