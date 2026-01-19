import { TextBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Textarea } from '../../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface TextPropertiesProps {
  block: TextBlock
  onUpdate: (block: TextBlock) => void
}

export const TextProperties = ({ block, onUpdate }: TextPropertiesProps) => {
  const updateProps = (updates: Partial<TextBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Content</Label>
        <Textarea
          value={block.props.content}
          onChange={(e) => updateProps({ content: e.target.value })}
          placeholder="Enter text content... Use {{field.path}} for data"
          className="min-h-[100px] text-sm font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Use {"{{field.path}}"} to insert data values
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Font Size</Label>
        <Select
          value={block.props.fontSize}
          onValueChange={(value: TextBlock['props']['fontSize']) =>
            updateProps({ fontSize: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="base">Normal</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
            <SelectItem value="2xl">2X Large</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="bold" className="text-sm">
          Bold
        </Label>
        <Switch
          id="bold"
          checked={block.props.bold}
          onCheckedChange={(checked) => updateProps({ bold: checked })}
        />
      </div>
    </div>
  )
}
