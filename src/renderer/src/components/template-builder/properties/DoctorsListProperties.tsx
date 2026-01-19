import { DoctorsListBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface DoctorsListPropertiesProps {
  block: DoctorsListBlock
  onUpdate: (block: DoctorsListBlock) => void
}

export const DoctorsListProperties = ({ block, onUpdate }: DoctorsListPropertiesProps) => {
  const updateProps = (updates: Partial<DoctorsListBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Show Doctors</Label>
        <Select
          value={block.props.type}
          onValueChange={(value: 'doneBy' | 'assistedBy' | 'both') =>
            updateProps({ type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both (Done By & Assisted By)</SelectItem>
            <SelectItem value="doneBy">Done By Only</SelectItem>
            <SelectItem value="assistedBy">Assisted By Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Layout</Label>
        <Select
          value={block.props.layout}
          onValueChange={(value: 'inline' | 'list') => updateProps({ layout: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inline">Inline (comma separated)</SelectItem>
            <SelectItem value="list">List (one per line)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showDesignation" className="text-sm">
          Show Designation
        </Label>
        <Switch
          id="showDesignation"
          checked={block.props.showDesignation}
          onCheckedChange={(checked) => updateProps({ showDesignation: checked })}
        />
      </div>
    </div>
  )
}
