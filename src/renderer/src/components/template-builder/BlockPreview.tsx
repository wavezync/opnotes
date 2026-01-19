import {
  Building2,
  Type,
  Tag,
  Table,
  FileText,
  MoveVertical,
  Users,
  GitBranch,
  Columns2,
  Image
} from 'lucide-react'
import { TemplateBlock } from '../../../../shared/types/template-blocks'
import { cn } from '../../lib/utils'

interface BlockPreviewProps {
  block: TemplateBlock
}

const BlockLabel = ({
  icon: Icon,
  label,
  description
}: {
  icon: React.ElementType
  label: string
  description?: string
}) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="font-medium">{label}</span>
    {description && (
      <span className="text-muted-foreground truncate">{description}</span>
    )}
  </div>
)

export const BlockPreview = ({ block }: BlockPreviewProps) => {
  switch (block.type) {
    case 'header':
      return (
        <BlockLabel
          icon={Building2}
          label="Header"
          description={`${block.props.showHospital ? 'Hospital' : ''} ${block.props.showUnit ? '+ Unit' : ''} ${block.props.showTelephone ? '+ Tel' : ''}`}
        />
      )

    case 'text':
      return (
        <div>
          <BlockLabel icon={Type} label="Text" />
          {block.props.content && (
            <div
              className={cn(
                'mt-1 text-sm text-muted-foreground truncate max-w-md',
                block.props.bold && 'font-semibold'
              )}
              dangerouslySetInnerHTML={{
                __html: block.props.content.substring(0, 100)
              }}
            />
          )}
        </div>
      )

    case 'data-field':
      return (
        <BlockLabel
          icon={Tag}
          label="Data Field"
          description={`${block.props.label || block.props.field}`}
        />
      )

    case 'data-table':
      return (
        <div>
          <BlockLabel
            icon={Table}
            label="Data Table"
            description={`${block.props.rows.length} rows, ${block.props.columns} columns`}
          />
          {block.props.rows.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {block.props.rows
                .slice(0, 3)
                .map((r) => r.label)
                .join(', ')}
              {block.props.rows.length > 3 && '...'}
            </div>
          )}
        </div>
      )

    case 'rich-content':
      return (
        <BlockLabel
          icon={FileText}
          label="Rich Content"
          description={block.props.sectionTitle || block.props.field}
        />
      )

    case 'divider':
      return (
        <div className="py-1">
          <hr
            className={cn(
              'border-t',
              block.props.style === 'dashed' && 'border-dashed',
              block.props.style === 'double' && 'border-double'
            )}
            style={{
              borderTopWidth: block.props.thickness
            }}
          />
        </div>
      )

    case 'spacer':
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MoveVertical className="h-4 w-4" />
          <span>Spacer ({block.props.height}px)</span>
        </div>
      )

    case 'doctors-list':
      return (
        <BlockLabel
          icon={Users}
          label="Doctors List"
          description={
            block.props.type === 'both'
              ? 'Done By + Assisted By'
              : block.props.type === 'doneBy'
                ? 'Done By'
                : 'Assisted By'
          }
        />
      )

    case 'conditional':
      return (
        <div>
          <BlockLabel
            icon={GitBranch}
            label="Conditional"
            description={`if ${block.props.field} ${block.props.condition}`}
          />
          {block.children && block.children.length > 0 && (
            <div className="mt-1 pl-4 border-l-2 border-muted">
              <span className="text-xs text-muted-foreground">
                {block.children.length} nested block{block.children.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )

    case 'two-column':
      return (
        <div>
          <BlockLabel
            icon={Columns2}
            label="Two Column"
            description={`${block.props.ratio}`}
          />
          <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
            <span>Left: {block.left?.length || 0} blocks</span>
            <span>Right: {block.right?.length || 0} blocks</span>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Image</span>
          {block.props.src && (
            <img
              src={block.props.src}
              alt={block.props.altText || 'Preview'}
              className="h-8 w-8 object-contain rounded"
            />
          )}
        </div>
      )

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown block type: {(block as TemplateBlock).type}
        </div>
      )
  }
}
