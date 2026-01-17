import { SurgeryTemplate } from '../types/db'

export class SurgeryTemplateModel implements SurgeryTemplate {
  id: number
  title: string
  content: string
  category: string
  tags: string | null
  doctor_id: number | null
  created_at: Date
  updated_at: Date

  constructor(data: SurgeryTemplate) {
    this.id = data.id
    this.title = data.title
    this.content = data.content
    this.category = data.category
    this.tags = data.tags
    this.doctor_id = data.doctor_id
    this.created_at = new Date(data.created_at)
    this.updated_at = new Date(data.updated_at)
  }

  // Parse tags JSON string to array
  getTags(): string[] {
    if (!this.tags) return []
    try {
      return JSON.parse(this.tags)
    } catch {
      return []
    }
  }

  // Check if this is a global template
  isGlobal(): boolean {
    return this.doctor_id === null
  }
}
