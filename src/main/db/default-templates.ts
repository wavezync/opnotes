/**
 * Single source of truth for default print templates.
 *
 * When templates need to be updated:
 * 1. Update the templates in this file
 * 2. Create a new migration that imports and applies these templates
 */

// Default surgery template structure - includes all fields
export const defaultSurgeryTemplate = {
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

// Default followup template structure
export const defaultFollowupTemplate = {
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

// Default page settings for templates
export const defaultPageSettings = {
  paperSize: 'a4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }
}
