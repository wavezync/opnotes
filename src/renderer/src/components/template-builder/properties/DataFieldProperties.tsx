import { DataFieldBlock } from '../../../../../shared/types/template-blocks'
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

interface DataFieldPropertiesProps {
  block: DataFieldBlock
  onUpdate: (block: DataFieldBlock) => void
}

export const DataFieldProperties = ({ block, onUpdate }: DataFieldPropertiesProps) => {
  const updateProps = (updates: Partial<DataFieldBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Data Field</Label>
        <Select
          value={block.props.field}
          onValueChange={(value) => {
            const field = TEMPLATE_FIELDS.find((f) => f.path === value)
            updateProps({
              field: value,
              label: field?.label || value.split('.').pop() || ''
            })
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_FIELDS.map((field) => (
              <SelectItem key={field.path} value={field.path}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Label</Label>
        <Input
          value={block.props.label}
          onChange={(e) => updateProps({ label: e.target.value })}
          placeholder="Field label"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Format</Label>
        <Select
          value={block.props.format}
          onValueChange={(value: 'none' | 'date' | 'age') =>
            updateProps({ format: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="age">Age (years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Fallback Value</Label>
        <Input
          value={block.props.fallback}
          onChange={(e) => updateProps({ fallback: e.target.value })}
          placeholder="Shown when value is empty"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Alignment</Label>
        <Select
          value={block.props.alignment}
          onValueChange={(value: 'left' | 'center' | 'right') =>
            updateProps({ alignment: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showLabel" className="text-sm">
          Show Label
        </Label>
        <Switch
          id="showLabel"
          checked={block.props.showLabel}
          onCheckedChange={(checked) => updateProps({ showLabel: checked })}
        />
      </div>
    </div>
  )
}
