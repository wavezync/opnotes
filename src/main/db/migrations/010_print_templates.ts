/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'

// Default surgery template structure that matches current Handlebars output
const defaultSurgeryTemplate = {
  version: 1,
  blocks: [
    {
      id: 'header-1',
      type: 'header',
      props: {
        showHospital: true,
        showUnit: true,
        showTelephone: true,
        showLogo: false,
        alignment: 'center'
      }
    },
    {
      id: 'divider-1',
      type: 'divider',
      props: {
        style: 'solid',
        thickness: 1
      }
    },
    {
      id: 'table-1',
      type: 'data-table',
      props: {
        columns: 4,
        rows: [
          { label: 'Name', field: 'patient.name', colspan: 3 },
          { label: 'BHT', field: 'surgery.bht' },
          { label: 'Date', field: 'surgery.date' },
          { label: 'Age/Sex', field: 'patient.age_gender' },
          { label: 'Ward', field: 'surgery.ward' }
        ],
        showBorders: true
      }
    },
    {
      id: 'conditional-doa-dod',
      type: 'conditional',
      props: {
        field: 'surgery.doa',
        condition: 'exists'
      },
      children: [
        {
          id: 'table-doa-dod',
          type: 'data-table',
          props: {
            columns: 4,
            rows: [
              { label: 'DoA', field: 'surgery.doa' },
              { label: 'DoD', field: 'surgery.dod' }
            ],
            showBorders: true
          }
        }
      ]
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      props: {
        height: 16
      }
    },
    {
      id: 'title-1',
      type: 'text',
      props: {
        content: '{{surgery.title}}',
        alignment: 'center',
        fontSize: 'lg',
        bold: true
      }
    },
    {
      id: 'spacer-2',
      type: 'spacer',
      props: {
        height: 12
      }
    },
    {
      id: 'doctors-1',
      type: 'doctors-list',
      props: {
        type: 'both',
        showDesignation: true,
        layout: 'inline'
      }
    },
    {
      id: 'spacer-3',
      type: 'spacer',
      props: {
        height: 16
      }
    },
    {
      id: 'conditional-notes',
      type: 'conditional',
      props: {
        field: 'surgery.notes',
        condition: 'notEmpty'
      },
      children: [
        {
          id: 'notes-1',
          type: 'rich-content',
          props: {
            field: 'surgery.notes',
            sectionTitle: 'Op Notes',
            showIfEmpty: false
          }
        }
      ]
    },
    {
      id: 'conditional-post-op',
      type: 'conditional',
      props: {
        field: 'surgery.post_op_notes',
        condition: 'notEmpty'
      },
      children: [
        {
          id: 'post-op-notes-1',
          type: 'rich-content',
          props: {
            field: 'surgery.post_op_notes',
            sectionTitle: 'Post-Op Notes',
            showIfEmpty: false
          }
        }
      ]
    }
  ]
}

// Default followup template structure that matches current Handlebars output
const defaultFollowupTemplate = {
  version: 1,
  blocks: [
    {
      id: 'header-1',
      type: 'header',
      props: {
        showHospital: true,
        showUnit: true,
        showTelephone: true,
        showLogo: false,
        alignment: 'center'
      }
    },
    {
      id: 'divider-1',
      type: 'divider',
      props: {
        style: 'solid',
        thickness: 1
      }
    },
    {
      id: 'table-1',
      type: 'data-table',
      props: {
        columns: 4,
        rows: [
          { label: 'Name', field: 'patient.name', colspan: 3 },
          { label: 'BHT', field: 'surgery.bht' },
          { label: 'Date', field: 'surgery.date' },
          { label: 'Age/Sex', field: 'patient.age_gender' },
          { label: 'Ward', field: 'surgery.ward' }
        ],
        showBorders: true
      }
    },
    {
      id: 'conditional-doa-dod',
      type: 'conditional',
      props: {
        field: 'surgery.doa',
        condition: 'exists'
      },
      children: [
        {
          id: 'table-doa-dod',
          type: 'data-table',
          props: {
            columns: 4,
            rows: [
              { label: 'DoA', field: 'surgery.doa' },
              { label: 'DoD', field: 'surgery.dod' }
            ],
            showBorders: true
          }
        }
      ]
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      props: {
        height: 16
      }
    },
    {
      id: 'title-1',
      type: 'text',
      props: {
        content: 'Follow-up Notes',
        alignment: 'center',
        fontSize: 'lg',
        bold: true
      }
    },
    {
      id: 'followup-date',
      type: 'data-field',
      props: {
        field: 'followup.date',
        label: '',
        format: 'date',
        fallback: '',
        showLabel: false,
        alignment: 'center'
      }
    },
    {
      id: 'spacer-2',
      type: 'spacer',
      props: {
        height: 16
      }
    },
    {
      id: 'conditional-followup-notes',
      type: 'conditional',
      props: {
        field: 'followup.notes',
        condition: 'notEmpty'
      },
      children: [
        {
          id: 'followup-notes-1',
          type: 'rich-content',
          props: {
            field: 'followup.notes',
            sectionTitle: '',
            showIfEmpty: false
          }
        }
      ]
    }
  ]
}

const defaultPageSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
}

export async function up(db: Kysely<any>): Promise<void> {
  // Create the print_templates table
  await db.schema
    .createTable('print_templates')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull()) // 'surgery' | 'followup'
    .addColumn('description', 'text')
    .addColumn('structure', 'text', (col) => col.notNull()) // JSON blob of blocks
    .addColumn('page_settings', 'text') // JSON: margins, orientation, paper size
    .addColumn('is_default', 'integer', (col) => col.defaultTo(0))
    .addColumn('created_at', 'integer', (col) => col.notNull())
    .addColumn('updated_at', 'integer', (col) => col.notNull())
    .execute()

  // Create index on type for faster filtering
  await db.schema
    .createIndex('print_templates_type_idx')
    .on('print_templates')
    .column('type')
    .execute()

  // Create unique partial index for default templates per type
  await sql`CREATE UNIQUE INDEX print_templates_default_idx ON print_templates(type) WHERE is_default = 1`.execute(
    db
  )

  const now = Date.now()

  // Seed default surgery template
  await db
    .insertInto('print_templates')
    .values({
      name: 'Surgery Op Note - Standard',
      type: 'surgery',
      description: 'Standard format with all patient and surgery information',
      structure: JSON.stringify(defaultSurgeryTemplate),
      page_settings: JSON.stringify(defaultPageSettings),
      is_default: 1,
      created_at: now,
      updated_at: now
    })
    .execute()

  // Seed default followup template
  await db
    .insertInto('print_templates')
    .values({
      name: 'Follow-up Note - Standard',
      type: 'followup',
      description: 'Standard follow-up format with patient info and notes',
      structure: JSON.stringify(defaultFollowupTemplate),
      page_settings: JSON.stringify(defaultPageSettings),
      is_default: 1,
      created_at: now,
      updated_at: now
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('print_templates').execute()
}
