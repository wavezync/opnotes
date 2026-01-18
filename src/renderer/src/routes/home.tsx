import { useQuery } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Skeleton } from '@renderer/components/ui/skeleton'
import {
  Users,
  Stethoscope,
  UserCog,
  Plus,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity
} from 'lucide-react'
import { formatDate } from '@renderer/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  trend?: string
  isLoading?: boolean
}

function StatCard({ title, value, description, icon, trend, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {trend && <TrendingUp className="h-3 w-3 text-green-500" />}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function QuickAction({ title, description, icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

interface RecentActivityItem {
  id: number
  type: 'patient' | 'surgery'
  title: string
  subtitle: string
  date: string
}

function RecentActivityList({
  items,
  isLoading
}: {
  items: RecentActivityItem[]
  isLoading: boolean
}) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={`${item.type}-${item.id}`}
          onClick={() => {
            if (item.type === 'patient') {
              navigate(`/patients/${item.id}`)
            }
          }}
          className="flex items-center gap-3 w-full rounded-lg p-2 text-left transition-colors hover:bg-accent"
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              item.type === 'patient'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            {item.type === 'patient' ? (
              <Users className="h-4 w-4" />
            ) : (
              <Stethoscope className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {item.date ? formatDate(new Date(item.date)) : ''}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { settings } = useSettings()

  const { data: stats, isLoading: statsLoading } = useQuery({
    ...queries.dashboard.stats,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    ...queries.dashboard.recentActivity(10)
  })

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Op Notes
        </h1>
        {settings?.hospital && (
          <p className="text-muted-foreground">
            {settings.hospital}
            {settings.unit && ` - ${settings.unit}`}
          </p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients ?? 0}
          description={`${stats?.patientsThisMonth ?? 0} added this month`}
          icon={<Users className="h-4 w-4" />}
          trend={stats?.patientsThisMonth ? '+' : undefined}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Surgeries"
          value={stats?.totalSurgeries ?? 0}
          description={`${stats?.surgeriesThisMonth ?? 0} this month`}
          icon={<Stethoscope className="h-4 w-4" />}
          trend={stats?.surgeriesThisMonth ? '+' : undefined}
          isLoading={statsLoading}
        />
        <StatCard
          title="Doctors"
          value={stats?.totalDoctors ?? 0}
          description="Registered doctors"
          icon={<UserCog className="h-4 w-4" />}
          isLoading={statsLoading}
        />
        <StatCard
          title="This Month"
          value={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          description={`${stats?.surgeriesThisMonth ?? 0} surgeries performed`}
          icon={<Calendar className="h-4 w-4" />}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction
              title="Add New Patient"
              description="Register a new patient in the system"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => navigate('/patients/add')}
            />
            <QuickAction
              title="View All Patients"
              description="Browse and search patients"
              icon={<Users className="h-5 w-5" />}
              onClick={() => navigate('/patients')}
            />
            <QuickAction
              title="View Surgeries"
              description="See all surgery records"
              icon={<Stethoscope className="h-5 w-5" />}
              onClick={() => navigate('/surgeries')}
            />
            <QuickAction
              title="Manage Doctors"
              description="View and manage doctor records"
              icon={<UserCog className="h-5 w-5" />}
              onClick={() => navigate('/doctors')}
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patients and surgeries</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityList
              items={recentActivity || []}
              isLoading={activityLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
