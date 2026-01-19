import { SpacerBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Slider } from '../../ui/slider'

interface SpacerPropertiesProps {
  block: SpacerBlock
  onUpdate: (block: SpacerBlock) => void
}

export const SpacerProperties = ({ block, onUpdate }: SpacerPropertiesProps) => {
  const updateProps = (updates: Partial<SpacerBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Height</Label>
          <span className="text-sm text-muted-foreground">{block.props.height}px</span>
        </div>
        <Slider
          value={[block.props.height]}
          onValueChange={([value]) => updateProps({ height: value })}
          min={4}
          max={100}
          step={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Custom Height</Label>
        <Input
          type="number"
          value={block.props.height}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10)
            if (!isNaN(value) && value > 0) {
              updateProps({ height: value })
            }
          }}
          min={1}
          max={500}
          className="h-8"
        />
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Preview</Label>
        <div className="border rounded-md bg-muted/30">
          <div
            className="bg-primary/20 flex items-center justify-center text-xs text-muted-foreground"
            style={{ height: Math.min(block.props.height, 100) }}
          >
            {block.props.height}px
          </div>
        </div>
      </div>
    </div>
  )
}
