import { DividerBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface DividerPropertiesProps {
  block: DividerBlock
  onUpdate: (block: DividerBlock) => void
}

export const DividerProperties = ({ block, onUpdate }: DividerPropertiesProps) => {
  const updateProps = (updates: Partial<DividerBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Style</Label>
        <Select
          value={block.props.style}
          onValueChange={(value: 'solid' | 'dashed' | 'double') =>
            updateProps({ style: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="double">Double</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Thickness</Label>
        <Select
          value={String(block.props.thickness)}
          onValueChange={(value) => updateProps({ thickness: Number(value) as 1 | 2 | 3 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Thin (1px)</SelectItem>
            <SelectItem value="2">Medium (2px)</SelectItem>
            <SelectItem value="3">Thick (3px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Preview</Label>
        <div className="p-3 border rounded-md bg-white">
          <hr
            style={{
              borderStyle: block.props.style === 'double' ? 'double' : block.props.style,
              borderWidth: block.props.style === 'double' ? block.props.thickness * 3 : block.props.thickness,
              borderColor: '#000'
            }}
          />
        </div>
      </div>
    </div>
  )
}
