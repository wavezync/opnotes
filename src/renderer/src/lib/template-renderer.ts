import {
  TemplateBlock,
  TemplateContext,
  TemplateStructure,
  HeaderBlock,
  TextBlock,
  DataFieldBlock,
  DataTableBlock,
  RichContentBlock,
  DividerBlock,
  SpacerBlock,
  DoctorsListBlock,
  ConditionalBlock,
  TwoColumnBlock,
  ImageBlock,
  PageBreakBlock
} from '../../../shared/types/template-blocks'

// Get a nested value from an object using dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown)
}

// Format a value based on the specified format
const formatValue = (value: unknown, format: 'none' | 'date' | 'age'): string => {
  if (value === null || value === undefined) return ''

  switch (format) {
    case 'date':
      if (typeof value === 'string') {
        return value
      }
      if (value instanceof Date) {
        return value.toLocaleDateString()
      }
      return String(value)
    case 'age':
      return `${value} years`
    default:
      return String(value)
  }
}

// Check if a condition is met
const checkCondition = (
  context: TemplateContext,
  field: string,
  condition: 'exists' | 'notEmpty' | 'isEmpty' | 'equals',
  compareValue?: string
): boolean => {
  const value = getNestedValue(context as unknown as Record<string, unknown>, field)

  switch (condition) {
    case 'exists':
      return value !== undefined && value !== null
    case 'notEmpty':
      return value !== undefined && value !== null && value !== ''
    case 'isEmpty':
      return value === undefined || value === null || value === ''
    case 'equals':
      return String(value) === compareValue
    default:
      return true
  }
}

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Render header block
const renderHeader = (block: HeaderBlock, context: TemplateContext): string => {
  const { props } = block
  const alignment = props.alignment || 'center'

  let html = `<div class="header-section keep-together" style="text-align: ${alignment}">`

  if (props.showLogo && props.logoSrc) {
    html += `<img src="${props.logoSrc}" alt="Logo" class="header-logo" style="max-height: 60px; margin-bottom: 8px" />`
  }

  if (props.showHospital && context.settings.hospital) {
    html += `<h1 class="text-2xl bold">${escapeHtml(context.settings.hospital)}</h1>`
  }

  if (props.showUnit && context.settings.unit) {
    html += `<h2 class="text-lg pt-1">${escapeHtml(context.settings.unit)}</h2>`
  }

  if (props.showTelephone && context.settings.telephone) {
    html += `<p class="text-sm pt-1">Tel: ${escapeHtml(context.settings.telephone)}</p>`
  }

  html += '</div>'
  return html
}

// Render text block - handles both static text and field interpolation
const renderText = (block: TextBlock, context: TemplateContext): string => {
  const { props } = block
  let content = props.content || ''

  // Replace {{field.path}} patterns with actual values
  content = content.replace(/\{\{([^}]+)\}\}/g, (_match, fieldPath) => {
    const value = getNestedValue(context as unknown as Record<string, unknown>, fieldPath.trim())
    return value !== undefined && value !== null ? escapeHtml(String(value)) : ''
  })

  const fontSizeClass = `text-${props.fontSize || 'base'}`
  const alignmentStyle = `text-align: ${props.alignment || 'left'}`
  const boldClass = props.bold ? 'bold' : ''
  const italicClass = props.italic ? 'italic' : ''
  const underlineClass = props.underline ? 'underline' : ''

  return `<div class="${fontSizeClass} ${boldClass} ${italicClass} ${underlineClass} keep-together" style="${alignmentStyle}">${content}</div>`
}

// Render data field block
const renderDataField = (block: DataFieldBlock, context: TemplateContext): string => {
  const { props } = block
  const value = getNestedValue(context as unknown as Record<string, unknown>, props.field)
  const formattedValue =
    value !== undefined && value !== null ? formatValue(value, props.format) : props.fallback || ''

  const alignment = `text-align: ${props.alignment || 'left'}`

  if (props.showLabel && props.label) {
    return `<div class="data-field keep-together" style="${alignment}"><span class="label">${escapeHtml(props.label)}:</span> ${escapeHtml(formattedValue)}</div>`
  }

  return `<div class="data-field keep-together" style="${alignment}">${escapeHtml(formattedValue)}</div>`
}

// Render data table block
const renderDataTable = (block: DataTableBlock, context: TemplateContext): string => {
  const { props } = block
  const columns = props.columns || 4
  const borderClass = props.showBorders ? 'info-table' : 'info-table no-borders'

  let html = `<table class="${borderClass} keep-together">`

  // Group rows into table rows based on column count
  // Each row in props.rows represents one cell pair (label + value)
  // For 4 columns, we show 2 label-value pairs per table row
  // For 2 columns, we show 1 label-value pair per table row
  // Colspan determines how many "slots" a cell takes up
  const slotsPerRow = columns / 2

  let i = 0
  while (i < props.rows.length) {
    html += '<tr>'
    let slotsUsed = 0

    while (slotsUsed < slotsPerRow && i < props.rows.length) {
      const row = props.rows[i]
      const value = getNestedValue(context as unknown as Record<string, unknown>, row.field)
      const displayValue = value !== undefined && value !== null ? String(value) : ''
      const colspan = row.colspan || 1

      html += `<td class="label">${escapeHtml(row.label)}:</td>`

      if (colspan > 1) {
        // Colspan spans multiple value columns (colspan * 2 - 1 because label takes 1)
        html += `<td colspan="${colspan * 2 - 1}">${escapeHtml(displayValue)}</td>`
      } else {
        html += `<td>${escapeHtml(displayValue)}</td>`
      }

      slotsUsed += colspan
      i++
    }

    html += '</tr>'
  }

  html += '</table>'
  return html
}

// Render rich content block (HTML content)
const renderRichContent = (block: RichContentBlock, context: TemplateContext): string => {
  const { props } = block
  const value = getNestedValue(context as unknown as Record<string, unknown>, props.field)

  if (!props.showIfEmpty && (!value || value === '')) {
    return ''
  }

  let html = '<div class="notes-section">'

  if (props.sectionTitle) {
    html += `<div class="section-header keep-together">${escapeHtml(props.sectionTitle)}</div>`
  }

  // Rich content is already HTML, render it directly (trusted content)
  html += `<div class="prose">${value || ''}</div>`
  html += '</div>'

  return html
}

// Render divider block
const renderDivider = (block: DividerBlock): string => {
  const { props } = block
  const style = props.style || 'solid'
  const thickness = props.thickness || 1

  const borderStyle =
    style === 'double' ? `${thickness * 3}px double` : `${thickness}px ${style}`

  return `<hr style="border: none; border-top: ${borderStyle} var(--print-border-color, #000); margin: 8px 0" />`
}

// Render spacer block
const renderSpacer = (block: SpacerBlock): string => {
  const height = block.props.height || 16
  return `<div style="height: ${height}px"></div>`
}

// Render doctors list block
const renderDoctorsList = (block: DoctorsListBlock, context: TemplateContext): string => {
  const { props } = block

  let html = '<div class="doctors-section keep-together">'

  const renderDoctors = (
    label: string,
    doctors: Array<{ name: string; designation: string | null }>
  ) => {
    if (!doctors || doctors.length === 0) return ''

    const doctorList =
      props.layout === 'list'
        ? doctors
            .map((d) => {
              if (props.showDesignation && d.designation) {
                return `<div>${escapeHtml(d.name)} (${escapeHtml(d.designation)})</div>`
              }
              return `<div>${escapeHtml(d.name)}</div>`
            })
            .join('')
        : doctors
            .map((d) => {
              if (props.showDesignation && d.designation) {
                return `${escapeHtml(d.name)} (${escapeHtml(d.designation)})`
              }
              return escapeHtml(d.name)
            })
            .join(', ')

    return `<div class="doctor-row"><span class="doctor-label">${escapeHtml(label)}:</span> ${props.layout === 'list' ? `<div>${doctorList}</div>` : `<span>${doctorList}</span>`}</div>`
  }

  if (props.type === 'doneBy' || props.type === 'both') {
    if (context.surgery.doneBy && context.surgery.doneBy.length > 0) {
      html += renderDoctors('Done By', context.surgery.doneBy)
    }
  }

  if (props.type === 'assistedBy' || props.type === 'both') {
    if (context.surgery.assistedBy && context.surgery.assistedBy.length > 0) {
      html += renderDoctors('Assisted By', context.surgery.assistedBy)
    }
  }

  html += '</div>'
  return html
}

// Render conditional block
const renderConditional = (
  block: ConditionalBlock,
  context: TemplateContext,
  renderBlocks: (blocks: TemplateBlock[], context: TemplateContext) => string
): string => {
  const { props, children } = block

  if (!checkCondition(context, props.field, props.condition, props.value)) {
    return ''
  }

  return renderBlocks(children || [], context)
}

// Render two-column block
const renderTwoColumn = (
  block: TwoColumnBlock,
  context: TemplateContext,
  renderBlocks: (blocks: TemplateBlock[], context: TemplateContext) => string
): string => {
  const { props, left, right } = block

  const ratioMap: Record<string, [string, string]> = {
    '50-50': ['50%', '50%'],
    '33-67': ['33.33%', '66.67%'],
    '67-33': ['66.67%', '33.33%'],
    '25-75': ['25%', '75%'],
    '75-25': ['75%', '25%']
  }

  const [leftWidth, rightWidth] = ratioMap[props.ratio] || ['50%', '50%']

  return `
    <div class="two-column keep-together" style="display: flex; gap: 16px">
      <div style="width: ${leftWidth}">${renderBlocks(left || [], context)}</div>
      <div style="width: ${rightWidth}">${renderBlocks(right || [], context)}</div>
    </div>
  `
}

// Render image block
const renderImage = (block: ImageBlock): string => {
  const { props } = block

  if (!props.src) return ''

  const alignment =
    {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    }[props.alignment] || 'center'

  return `
    <div class="image-block keep-together" style="display: flex; justify-content: ${alignment}">
      <img
        src="${props.src}"
        alt="${escapeHtml(props.altText || '')}"
        style="max-width: ${props.width}px; max-height: ${props.height}px; object-fit: contain"
      />
    </div>
  `
}

// Render page break block
const renderPageBreak = (_block: PageBreakBlock): string => {
  return '<div class="page-break" style="page-break-before: always"></div>'
}

// Render a single block
const renderBlock = (
  block: TemplateBlock,
  context: TemplateContext,
  renderBlocks: (blocks: TemplateBlock[], context: TemplateContext) => string
): string => {
  switch (block.type) {
    case 'header':
      return renderHeader(block, context)
    case 'text':
      return renderText(block, context)
    case 'data-field':
      return renderDataField(block, context)
    case 'data-table':
      return renderDataTable(block, context)
    case 'rich-content':
      return renderRichContent(block, context)
    case 'divider':
      return renderDivider(block)
    case 'spacer':
      return renderSpacer(block)
    case 'doctors-list':
      return renderDoctorsList(block, context)
    case 'conditional':
      return renderConditional(block, context, renderBlocks)
    case 'two-column':
      return renderTwoColumn(block, context, renderBlocks)
    case 'image':
      return renderImage(block)
    case 'page-break':
      return renderPageBreak(block)
    default:
      console.warn(`Unknown block type: ${(block as TemplateBlock).type}`)
      return ''
  }
}

// Render an array of blocks
const renderBlocks = (blocks: TemplateBlock[], context: TemplateContext): string => {
  return blocks.map((block) => renderBlock(block, context, renderBlocks)).join('\n')
}

// Main render function
export const renderTemplate = (
  template: TemplateStructure,
  context: TemplateContext
): string => {
  const html = renderBlocks(template.blocks, context)
  return `<div class="document">${html}</div>`
}
