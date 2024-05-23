import { Followup } from '../types/db'

export class FollowupModel implements Followup {
  id: number
  notes: string
  surgery_id: number
  created_at: Date
  updated_at: Date

  constructor(data: Followup) {
    this.id = data.id
    this.notes = data.notes
    this.surgery_id = data.surgery_id
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
  }
}
