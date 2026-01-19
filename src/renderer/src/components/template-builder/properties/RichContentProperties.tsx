import { RichContentBlock } from '../../../../../shared/types/template-blocks'
import { TEMPLATE_FIELDS } from '../../../../../shared/constants/template-fields'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Switch } from '../../ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface RichContentPropertiesProps {
  block: RichContentBlock
  onUpdate: (block: RichContentBlock) => void
}

export const RichContentProperties = ({ block, onUpdate }: RichContentPropertiesProps) => {
  const updateProps = (updates: Partial<RichContentBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  // Filter to only HTML fields
  const htmlFields = TEMPLATE_FIELDS.filter((f) => f.isHtml)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Content Field</Label>
        <Select
          value={block.props.field}
          onValueChange={(value) => updateProps({ field: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {htmlFields.map((field) => (
              <SelectItem key={field.path} value={field.path}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select an HTML content field to display
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Section Title</Label>
        <Input
          value={block.props.sectionTitle}
          onChange={(e) => updateProps({ sectionTitle: e.target.value })}
          placeholder="e.g., Op Notes (leave empty for no title)"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showIfEmpty" className="text-sm">
          Show When Empty
        </Label>
        <Switch
          id="showIfEmpty"
          checked={block.props.showIfEmpty}
          onCheckedChange={(checked) => updateProps({ showIfEmpty: checked })}
        />
      </div>
    </div>
  )
}
