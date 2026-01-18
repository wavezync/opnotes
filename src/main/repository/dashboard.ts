import { db } from '../db'
import { sql } from 'kysely'

export interface DashboardStats {
  totalPatients: number
  totalSurgeries: number
  totalDoctors: number
  surgeriesThisMonth: number
  patientsThisMonth: number
}

export interface RecentActivityItem {
  id: number
  type: 'patient' | 'surgery'
  title: string
  subtitle: string
  date: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartTimestamp = firstDayOfMonth.getTime()

  // Get total counts
  const patientCount = await db
    .selectFrom('patients')
    .select(sql<number>`count(*)`.as('count'))
    .executeTakeFirst()

  const surgeryCount = await db
    .selectFrom('surgeries')
    .select(sql<number>`count(*)`.as('count'))
    .executeTakeFirst()

  const doctorCount = await db
    .selectFrom('doctors')
    .select(sql<number>`count(*)`.as('count'))
    .executeTakeFirst()

  // Get this month's counts using raw SQL for date comparison
  const surgeriesThisMonth = await db
    .selectFrom('surgeries')
    .select(sql<number>`count(*)`.as('count'))
    .where(sql<boolean>`created_at >= ${monthStartTimestamp}`)
    .executeTakeFirst()

  const patientsThisMonth = await db
    .selectFrom('patients')
    .select(sql<number>`count(*)`.as('count'))
    .where(sql<boolean>`created_at >= ${monthStartTimestamp}`)
    .executeTakeFirst()

  return {
    totalPatients: Number(patientCount?.count || 0),
    totalSurgeries: Number(surgeryCount?.count || 0),
    totalDoctors: Number(doctorCount?.count || 0),
    surgeriesThisMonth: Number(surgeriesThisMonth?.count || 0),
    patientsThisMonth: Number(patientsThisMonth?.count || 0)
  }
}

export async function getRecentActivity(limit: number = 10): Promise<RecentActivityItem[]> {
  // Get recent patients
  const recentPatients = await db
    .selectFrom('patients')
    .select(['id', 'name', 'phn', 'created_at'])
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()

  // Get recent surgeries with patient info
  const recentSurgeries = await db
    .selectFrom('surgeries')
    .innerJoin('patients', 'patients.id', 'surgeries.patient_id')
    .select([
      'surgeries.id',
      'surgeries.bht',
      'surgeries.title',
      'surgeries.created_at',
      'patients.name'
    ])
    .orderBy('surgeries.created_at', 'desc')
    .limit(limit)
    .execute()

  // Helper to convert Date to ISO string
  const dateToString = (date: Date | null | undefined): string => {
    if (!date) return ''
    return date instanceof Date ? date.toISOString() : String(date)
  }

  // Combine and sort by date
  const activity: RecentActivityItem[] = [
    ...recentPatients.map((p) => ({
      id: p.id,
      type: 'patient' as const,
      title: p.name,
      subtitle: `PHN: ${p.phn}`,
      date: dateToString(p.created_at)
    })),
    ...recentSurgeries.map((s) => ({
      id: s.id,
      type: 'surgery' as const,
      title: s.name,
      subtitle: s.title || `BHT: ${s.bht}`,
      date: dateToString(s.created_at)
    }))
  ]

  // Sort by date descending and limit
  return activity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
