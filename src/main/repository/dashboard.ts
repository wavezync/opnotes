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
  type: 'patient' | 'surgery' | 'followup'
  title: string
  subtitle: string
  date: string
  // Navigation fields
  patientId?: number
  surgeryId?: number
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
      'surgeries.patient_id',
      'patients.name'
    ])
    .orderBy('surgeries.created_at', 'desc')
    .limit(limit)
    .execute()

  // Get recent followups with surgery and patient info
  const recentFollowups = await db
    .selectFrom('surgery_followups')
    .innerJoin('surgeries', 'surgeries.id', 'surgery_followups.surgery_id')
    .innerJoin('patients', 'patients.id', 'surgeries.patient_id')
    .select([
      'surgery_followups.id',
      'surgery_followups.notes',
      'surgery_followups.created_at',
      'surgery_followups.surgery_id',
      'surgeries.title as surgery_title',
      'surgeries.patient_id',
      'patients.name as patient_name'
    ])
    .orderBy('surgery_followups.created_at', 'desc')
    .limit(limit)
    .execute()

  // Helper to convert Date or timestamp to ISO string
  const dateToString = (date: Date | number | null | undefined): string => {
    if (!date) return ''
    if (date instanceof Date) {
      return date.toISOString()
    }
    // Handle numeric timestamps
    if (typeof date === 'number') {
      return new Date(date).toISOString()
    }
    return ''
  }

  // Helper to extract preview from notes (strip HTML and truncate)
  const getNotesPreview = (notes: string): string => {
    const text = notes.replace(/<[^>]*>/g, '').trim()
    return text.length > 50 ? text.slice(0, 50) + '...' : text
  }

  // Combine and sort by date
  const activity: RecentActivityItem[] = [
    ...recentPatients.map((p) => ({
      id: p.id,
      type: 'patient' as const,
      title: p.name,
      subtitle: `PHN: ${p.phn}`,
      date: dateToString(p.created_at),
      patientId: p.id
    })),
    ...recentSurgeries.map((s) => ({
      id: s.id,
      type: 'surgery' as const,
      title: s.name,
      subtitle: s.title || `BHT: ${s.bht}`,
      date: dateToString(s.created_at),
      patientId: s.patient_id,
      surgeryId: s.id
    })),
    ...recentFollowups.map((f) => ({
      id: f.id,
      type: 'followup' as const,
      title: f.patient_name,
      subtitle: f.surgery_title ? `${f.surgery_title}: ${getNotesPreview(f.notes)}` : getNotesPreview(f.notes),
      date: dateToString(f.created_at),
      patientId: f.patient_id,
      surgeryId: f.surgery_id
    }))
  ]

  // Sort by date descending and limit
  return activity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
