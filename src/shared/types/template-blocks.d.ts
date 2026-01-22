// Print Template Block Types

export type TemplateType = 'surgery' | 'followup'

// Base block interface
export interface BaseBlock {
  id: string
  type: string
}

// Block type definitions

export interface HeaderBlockProps {
  showHospital: boolean
  showUnit: boolean
  showTelephone: boolean
  showLogo: boolean
  alignment: 'left' | 'center' | 'right'
  logoSrc?: string // base64 image
}

export interface HeaderBlock extends BaseBlock {
  type: 'header'
  props: HeaderBlockProps
}

export interface TextBlockProps {
  content: string // HTML via TipTap
  alignment: 'left' | 'center' | 'right'
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  props: TextBlockProps
}

export interface DataFieldBlockProps {
  field: string // field path like 'patient.name' or 'surgery.bht'
  label: string
  format: 'none' | 'date' | 'age'
  fallback: string // shown when value is empty
  showLabel: boolean
  alignment: 'left' | 'center' | 'right'
}

export interface DataFieldBlock extends BaseBlock {
  type: 'data-field'
  props: DataFieldBlockProps
}

export interface DataTableRow {
  label: string
  field: string
  colspan?: number
}

export interface DataTableBlockProps {
  rows: DataTableRow[]
  columns: 2 | 4
  showBorders: boolean
}

export interface DataTableBlock extends BaseBlock {
  type: 'data-table'
  props: DataTableBlockProps
}

export interface RichContentBlockProps {
  field: string // field path for HTML content (e.g., 'surgery.notes')
  sectionTitle: string
  showIfEmpty: boolean
}

export interface RichContentBlock extends BaseBlock {
  type: 'rich-content'
  props: RichContentBlockProps
}

export interface DividerBlockProps {
  style: 'solid' | 'dashed' | 'double'
  thickness: 1 | 2 | 3
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
  props: DividerBlockProps
}

export interface SpacerBlockProps {
  height: number // in pixels
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer'
  props: SpacerBlockProps
}

export interface DoctorsListBlockProps {
  type: 'doneBy' | 'assistedBy' | 'both'
  showDesignation: boolean
  layout: 'inline' | 'list'
}

export interface DoctorsListBlock extends BaseBlock {
  type: 'doctors-list'
  props: DoctorsListBlockProps
}

export type ConditionalOperator = 'exists' | 'notEmpty' | 'isEmpty' | 'equals'

export interface ConditionalBlockProps {
  field: string
  condition: ConditionalOperator
  value?: string // for 'equals' condition
}

export interface ConditionalBlock extends BaseBlock {
  type: 'conditional'
  props: ConditionalBlockProps
  children: TemplateBlock[]
}

export interface TwoColumnBlockProps {
  ratio: '50-50' | '33-67' | '67-33' | '25-75' | '75-25'
}

export interface TwoColumnBlock extends BaseBlock {
  type: 'two-column'
  props: TwoColumnBlockProps
  left: TemplateBlock[]
  right: TemplateBlock[]
}

export interface ImageBlockProps {
  src: string // base64 image
  width: number
  height: number
  alignment: 'left' | 'center' | 'right'
  altText: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  props: ImageBlockProps
}

export interface PageBreakBlock extends BaseBlock {
  type: 'page-break'
  props: Record<string, never>
}

// Union type of all block types
export type TemplateBlock =
  | HeaderBlock
  | TextBlock
  | DataFieldBlock
  | DataTableBlock
  | RichContentBlock
  | DividerBlock
  | SpacerBlock
  | DoctorsListBlock
  | ConditionalBlock
  | TwoColumnBlock
  | ImageBlock
  | PageBreakBlock

// Block type string literals
export type BlockType = TemplateBlock['type']

// Page settings
export interface PageSettings {
  paperSize: 'a4' | 'letter' | 'legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Template structure (stored as JSON in database)
export interface TemplateStructure {
  version: number
  blocks: TemplateBlock[]
}

// Print Template (database row)
export interface PrintTemplateTable {
  id: number
  name: string
  type: TemplateType
  description: string | null
  structure: string // JSON string of TemplateStructure
  page_settings: string | null // JSON string of PageSettings
  is_default: number // SQLite uses integer for boolean
  created_at: number
  updated_at: number
}

// Parsed print template for use in code
export interface PrintTemplate {
  id: number
  name: string
  type: TemplateType
  description: string | null
  structure: TemplateStructure
  pageSettings: PageSettings | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Input types for CRUD operations
export interface NewPrintTemplate {
  name: string
  type: TemplateType
  description?: string | null
  structure: TemplateStructure
  pageSettings?: PageSettings | null
  isDefault?: boolean
}

export interface PrintTemplateUpdate {
  name?: string
  description?: string | null
  structure?: TemplateStructure
  pageSettings?: PageSettings | null
  isDefault?: boolean
}

// Filter for listing templates
export interface PrintTemplateFilter {
  type?: TemplateType
  search?: string
}

// Default Print Template (read-only, for restoring)
export interface DefaultPrintTemplate {
  id: number
  key: string
  name: string
  type: TemplateType
  description: string | null
  structure: TemplateStructure
  pageSettings: PageSettings | null
}

// Available data fields for template builder UI
export interface FieldDefinition {
  path: string
  label: string
  category: 'patient' | 'surgery' | 'followup' | 'settings'
  description: string
  example: string
  isHtml?: boolean
}

// Context data passed to template renderer
export interface TemplateContext {
  patient: {
    name: string
    age: number
    gender: string
    age_gender: string
    phn: string
    address: string | null
    phone: string | null
    blood_group: string | null
    allergies: string | null
    conditions: string | null
    medications: string | null
    emergency_contact: string | null
    emergency_phone: string | null
    remarks: string | null
  }
  surgery: {
    title: string
    bht: string
    ward: string
    date: string | null
    doa: string | null
    dod: string | null
    notes: string | null
    inward_management: string | null
    post_op_notes: string | null
    discharge_plan: string | null
    referral: string | null
    doneByAsString: string
    assistedByAsString: string
    doneBy: Array<{ name: string; designation: string | null }>
    assistedBy: Array<{ name: string; designation: string | null }>
  }
  followup?: {
    date: string | null
    notes: string | null
  }
  settings: {
    hospital: string
    unit: string
    telephone: string | null
  }
}

// Block metadata for the builder palette
export interface BlockDefinition {
  type: BlockType
  label: string
  icon: string // Lucide icon name
  category: 'structure' | 'content' | 'data' | 'logic'
  description: string
  defaultProps: Record<string, unknown>
}
