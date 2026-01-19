import { useRef } from 'react'
import { ImageBlock } from '../../../../../shared/types/template-blocks'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Upload, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface ImagePropertiesProps {
  block: ImageBlock
  onUpdate: (block: ImageBlock) => void
}

export const ImageProperties = ({ block, onUpdate }: ImagePropertiesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProps = (updates: Partial<ImageBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      updateProps({ src: base64 })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    updateProps({ src: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {block.props.src ? (
          <div className="space-y-2">
            <div className="relative border rounded-md p-2 bg-white">
              <img
                src={block.props.src}
                alt={block.props.altText || 'Preview'}
                className="max-h-32 mx-auto object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-2" />
              Change Image
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-20"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload Image</span>
            </div>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Max Width</Label>
          <Input
            type="number"
            value={block.props.width}
            onChange={(e) => updateProps({ width: parseInt(e.target.value, 10) || 100 })}
            min={10}
            max={800}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Height</Label>
          <Input
            type="number"
            value={block.props.height}
            onChange={(e) => updateProps({ height: parseInt(e.target.value, 10) || 100 })}
            min={10}
            max={800}
            className="h-8"
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

      <div className="space-y-2">
        <Label className="text-sm">Alt Text</Label>
        <Input
          value={block.props.altText}
          onChange={(e) => updateProps({ altText: e.target.value })}
          placeholder="Image description"
        />
      </div>
    </div>
  )
}
