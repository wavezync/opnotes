import { FieldDefinition, BlockDefinition } from '../types/template-blocks'

// Available data fields for template builder
export const TEMPLATE_FIELDS: FieldDefinition[] = [
  // Patient fields
  {
    path: 'patient.name',
    label: 'Patient Name',
    category: 'patient',
    description: 'Full name of the patient',
    example: 'John Doe'
  },
  {
    path: 'patient.age',
    label: 'Patient Age',
    category: 'patient',
    description: 'Age calculated from birth year',
    example: '45'
  },
  {
    path: 'patient.gender',
    label: 'Gender',
    category: 'patient',
    description: 'Patient gender (M/F)',
    example: 'M'
  },
  {
    path: 'patient.age_gender',
    label: 'Age / Gender',
    category: 'patient',
    description: 'Combined age and gender display',
    example: '45 / M'
  },
  {
    path: 'patient.phn',
    label: 'PHN',
    category: 'patient',
    description: 'Patient hospital number',
    example: 'PHN-12345'
  },
  {
    path: 'patient.address',
    label: 'Address',
    category: 'patient',
    description: 'Patient address',
    example: '123 Main St, Colombo'
  },
  {
    path: 'patient.phone',
    label: 'Phone',
    category: 'patient',
    description: 'Patient phone number',
    example: '+94 71 234 5678'
  },
  {
    path: 'patient.blood_group',
    label: 'Blood Group',
    category: 'patient',
    description: 'Patient blood group',
    example: 'O+'
  },
  {
    path: 'patient.allergies',
    label: 'Allergies',
    category: 'patient',
    description: 'Known allergies',
    example: 'Penicillin, Latex'
  },
  {
    path: 'patient.conditions',
    label: 'Medical Conditions',
    category: 'patient',
    description: 'Pre-existing medical conditions',
    example: 'Diabetes, Hypertension'
  },
  {
    path: 'patient.medications',
    label: 'Current Medications',
    category: 'patient',
    description: 'Current medications',
    example: 'Metformin, Lisinopril'
  },
  {
    path: 'patient.emergency_contact',
    label: 'Emergency Contact',
    category: 'patient',
    description: 'Emergency contact name',
    example: 'Jane Doe'
  },
  {
    path: 'patient.emergency_phone',
    label: 'Emergency Phone',
    category: 'patient',
    description: 'Emergency contact phone',
    example: '+94 71 987 6543'
  },
  {
    path: 'patient.remarks',
    label: 'Remarks',
    category: 'patient',
    description: 'Additional patient remarks',
    example: 'Previous surgeries: Appendectomy (2020)'
  },

  // Surgery fields
  {
    path: 'surgery.title',
    label: 'Surgery Title',
    category: 'surgery',
    description: 'Name/title of the surgery',
    example: 'Laparoscopic Cholecystectomy'
  },
  {
    path: 'surgery.bht',
    label: 'BHT Number',
    category: 'surgery',
    description: 'Bed head ticket number',
    example: 'BHT-2024-001'
  },
  {
    path: 'surgery.ward',
    label: 'Ward',
    category: 'surgery',
    description: 'Hospital ward',
    example: 'Ward 5A'
  },
  {
    path: 'surgery.date',
    label: 'Surgery Date',
    category: 'surgery',
    description: 'Date of surgery',
    example: '2024-01-15'
  },
  {
    path: 'surgery.doa',
    label: 'Date of Admission',
    category: 'surgery',
    description: 'Date patient was admitted',
    example: '2024-01-14'
  },
  {
    path: 'surgery.dod',
    label: 'Date of Discharge',
    category: 'surgery',
    description: 'Date patient was discharged',
    example: '2024-01-17'
  },
  {
    path: 'surgery.notes',
    label: 'Op Notes',
    category: 'surgery',
    description: 'Operative notes (HTML content)',
    example: '<p>Surgery was performed under general anesthesia...</p>',
    isHtml: true
  },
  {
    path: 'surgery.inward_management',
    label: 'Inward Management',
    category: 'surgery',
    description: 'IV drugs and medications during admission (HTML content)',
    example: '<p>IV Ceftriaxone 1g BD, IV Metronidazole...</p>',
    isHtml: true
  },
  {
    path: 'surgery.post_op_notes',
    label: 'Post-Op Notes',
    category: 'surgery',
    description: 'Post-operative notes (HTML content)',
    example: '<p>Patient recovered well...</p>',
    isHtml: true
  },
  {
    path: 'surgery.discharge_plan',
    label: 'Discharge Plan',
    category: 'surgery',
    description: 'Discharge plan and instructions (HTML content)',
    example: '<p>Patient may resume normal activities in 2 weeks...</p>',
    isHtml: true
  },
  {
    path: 'surgery.referral',
    label: 'Referral Letter',
    category: 'surgery',
    description: 'Referral for wound management or follow-up care (HTML content)',
    example: '<p>Please review for wound management...</p>',
    isHtml: true
  },
  {
    path: 'surgery.doneByAsString',
    label: 'Done By (Text)',
    category: 'surgery',
    description: 'Surgeons who performed the surgery as text',
    example: 'Dr. Smith, Dr. Jones'
  },
  {
    path: 'surgery.assistedByAsString',
    label: 'Assisted By (Text)',
    category: 'surgery',
    description: 'Surgeons who assisted as text',
    example: 'Dr. Brown, Dr. Wilson'
  },

  // Follow-up fields
  {
    path: 'followup.date',
    label: 'Follow-up Date',
    category: 'followup',
    description: 'Date of follow-up visit',
    example: '2024-01-25'
  },
  {
    path: 'followup.notes',
    label: 'Follow-up Notes',
    category: 'followup',
    description: 'Follow-up notes (HTML content)',
    example: '<p>Patient reports no complications...</p>',
    isHtml: true
  },

  // Settings fields
  {
    path: 'settings.hospital',
    label: 'Hospital Name',
    category: 'settings',
    description: 'Name of the hospital',
    example: 'National Cancer Institute'
  },
  {
    path: 'settings.subtitle',
    label: 'Subtitle',
    category: 'settings',
    description: 'Optional second line below hospital name',
    example: 'Teaching Hospital'
  },
  {
    path: 'settings.unit',
    label: 'Unit/Department',
    category: 'settings',
    description: 'Unit or department name',
    example: 'Surgical Unit A'
  },
  {
    path: 'settings.telephone',
    label: 'Telephone',
    category: 'settings',
    description: 'Hospital contact number',
    example: '+94 11 234 5678'
  }
]

// Group fields by category for UI display
export const FIELDS_BY_CATEGORY = TEMPLATE_FIELDS.reduce(
  (acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = []
    }
    acc[field.category].push(field)
    return acc
  },
  {} as Record<string, FieldDefinition[]>
)

// Block definitions for the palette
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    icon: 'Building2',
    category: 'structure',
    description: 'Hospital header with name, unit, and contact info',
    defaultProps: {
      showHospital: true,
      showSubtitle: true,
      showUnit: true,
      showTelephone: true,
      showLogo: false,
      alignment: 'center'
    }
  },
  {
    type: 'text',
    label: 'Text',
    icon: 'Type',
    category: 'content',
    description: 'Static formatted text block',
    defaultProps: {
      content: '',
      alignment: 'left',
      fontSize: 'base',
      bold: false,
      italic: false,
      underline: false
    }
  },
  {
    type: 'data-field',
    label: 'Data Field',
    icon: 'Tag',
    category: 'data',
    description: 'Display a single data value',
    defaultProps: {
      field: 'patient.name',
      label: 'Name',
      format: 'none',
      fallback: '-',
      showLabel: true,
      alignment: 'left'
    }
  },
  {
    type: 'data-table',
    label: 'Data Table',
    icon: 'Table',
    category: 'data',
    description: 'Key-value table with multiple fields',
    defaultProps: {
      columns: 4,
      rows: [],
      showBorders: true
    }
  },
  {
    type: 'rich-content',
    label: 'Rich Content',
    icon: 'FileText',
    category: 'content',
    description: 'Render HTML content from a field',
    defaultProps: {
      field: 'surgery.notes',
      sectionTitle: '',
      showIfEmpty: false
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: 'Minus',
    category: 'structure',
    description: 'Horizontal line separator',
    defaultProps: {
      style: 'solid',
      thickness: 1
    }
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: 'MoveVertical',
    category: 'structure',
    description: 'Vertical spacing',
    defaultProps: {
      height: 16
    }
  },
  {
    type: 'doctors-list',
    label: 'Doctors List',
    icon: 'Users',
    category: 'data',
    description: 'List of doctors who performed or assisted',
    defaultProps: {
      type: 'both',
      showDesignation: true,
      layout: 'inline'
    }
  },
  {
    type: 'conditional',
    label: 'Conditional',
    icon: 'GitBranch',
    category: 'logic',
    description: 'Show/hide section based on condition',
    defaultProps: {
      field: 'surgery.notes',
      condition: 'notEmpty'
    }
  },
  {
    type: 'two-column',
    label: 'Two Column',
    icon: 'Columns2',
    category: 'structure',
    description: 'Side-by-side layout',
    defaultProps: {
      ratio: '50-50'
    }
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'Image',
    category: 'content',
    description: 'Static image or logo',
    defaultProps: {
      src: '',
      width: 100,
      height: 100,
      alignment: 'center',
      altText: ''
    }
  },
  {
    type: 'page-break',
    label: 'Page Break',
    icon: 'SeparatorHorizontal',
    category: 'structure',
    description: 'Force content after this to print on a new page',
    defaultProps: {}
  }
]

// Group blocks by category for palette display
export const BLOCKS_BY_CATEGORY = BLOCK_DEFINITIONS.reduce(
  (acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = []
    }
    acc[block.category].push(block)
    return acc
  },
  {} as Record<string, BlockDefinition[]>
)

// Category labels for display
export const CATEGORY_LABELS: Record<string, string> = {
  structure: 'Structure',
  content: 'Content',
  data: 'Data',
  logic: 'Logic',
  patient: 'Patient',
  surgery: 'Surgery',
  followup: 'Follow-up',
  settings: 'Settings'
}

// Default page settings
export const DEFAULT_PAGE_SETTINGS = {
  paperSize: 'a4' as const,
  orientation: 'portrait' as const,
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
}
