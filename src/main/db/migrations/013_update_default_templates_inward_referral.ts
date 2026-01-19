/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

// Updated default surgery template with inward_management and referral fields
const updatedSurgeryTemplate = {
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
          { label: 'Ward', field: 'surgery.ward' },
          { label: 'DoA', field: 'surgery.doa' },
          { label: 'DoD', field: 'surgery.dod' }
        ],
        showBorders: true
      }
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
      id: 'conditional-inward-management',
      type: 'conditional',
      props: {
        field: 'surgery.inward_management',
        condition: 'notEmpty'
      },
      children: [
        {
          id: 'inward-management-1',
          type: 'rich-content',
          props: {
            field: 'surgery.inward_management',
            sectionTitle: 'Inward Management',
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
    },
    {
      id: 'conditional-referral',
      type: 'conditional',
      props: {
        field: 'surgery.referral',
        condition: 'notEmpty'
      },
      children: [
        {
          id: 'referral-1',
          type: 'rich-content',
          props: {
            field: 'surgery.referral',
            sectionTitle: 'Referral',
            showIfEmpty: false
          }
        }
      ]
    }
  ]
}

export async function up(db: Kysely<any>): Promise<void> {
  // Update the default surgery template to include inward_management and referral
  await db
    .updateTable('default_print_templates')
    .set({
      structure: JSON.stringify(updatedSurgeryTemplate)
    })
    .where('key', '=', 'surgery-standard')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert to original surgery template without inward_management and referral
  const originalSurgeryTemplate = {
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
            { label: 'Ward', field: 'surgery.ward' },
            { label: 'DoA', field: 'surgery.doa' },
            { label: 'DoD', field: 'surgery.dod' }
          ],
          showBorders: true
        }
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

  await db
    .updateTable('default_print_templates')
    .set({
      structure: JSON.stringify(originalSurgeryTemplate)
    })
    .where('key', '=', 'surgery-standard')
    .execute()
}
