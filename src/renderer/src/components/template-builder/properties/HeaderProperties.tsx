import { HeaderBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface HeaderPropertiesProps {
  block: HeaderBlock
  onUpdate: (block: HeaderBlock) => void
}

export const HeaderProperties = ({ block, onUpdate }: HeaderPropertiesProps) => {
  const updateProps = (updates: Partial<HeaderBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="showHospital" className="text-sm">
            Show Hospital Name
          </Label>
          <Switch
            id="showHospital"
            checked={block.props.showHospital}
            onCheckedChange={(checked) => updateProps({ showHospital: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showUnit" className="text-sm">
            Show Unit
          </Label>
          <Switch
            id="showUnit"
            checked={block.props.showUnit}
            onCheckedChange={(checked) => updateProps({ showUnit: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showTelephone" className="text-sm">
            Show Telephone
          </Label>
          <Switch
            id="showTelephone"
            checked={block.props.showTelephone}
            onCheckedChange={(checked) => updateProps({ showTelephone: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showLogo" className="text-sm">
            Show Logo
          </Label>
          <Switch
            id="showLogo"
            checked={block.props.showLogo}
            onCheckedChange={(checked) => updateProps({ showLogo: checked })}
          />
        </div>
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
    </div>
  )
}
