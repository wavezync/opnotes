import { DataTableBlock, DataTableRow } from '../../../../../shared/types/template-blocks'
import { TEMPLATE_FIELDS } from '../../../../../shared/constants/template-fields'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Switch } from '../../ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'

interface DataTablePropertiesProps {
  block: DataTableBlock
  onUpdate: (block: DataTableBlock) => void
}

export const DataTableProperties = ({ block, onUpdate }: DataTablePropertiesProps) => {
  const updateProps = (updates: Partial<DataTableBlock['props']>) => {
    onUpdate({
      ...block,
      props: { ...block.props, ...updates }
    })
  }

  const addRow = () => {
    const newRow: DataTableRow = {
      label: 'Label',
      field: 'patient.name'
    }
    updateProps({ rows: [...block.props.rows, newRow] })
  }

  const updateRow = (index: number, updates: Partial<DataTableRow>) => {
    const rows = [...block.props.rows]
    rows[index] = { ...rows[index], ...updates }
    updateProps({ rows })
  }

  const removeRow = (index: number) => {
    const rows = block.props.rows.filter((_, i) => i !== index)
    updateProps({ rows })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Columns</Label>
        <Select
          value={String(block.props.columns)}
          onValueChange={(value) => updateProps({ columns: Number(value) as 2 | 4 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="showBorders" className="text-sm">
          Show Borders
        </Label>
        <Switch
          id="showBorders"
          checked={block.props.showBorders}
          onCheckedChange={(checked) => updateProps({ showBorders: checked })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Rows</Label>
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
        </div>

        <div className="space-y-2">
          {block.props.rows.map((row, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 border rounded-md bg-muted/30"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={row.label}
                  onChange={(e) => updateRow(index, { label: e.target.value })}
                  placeholder="Label"
                  className="h-8 text-sm"
                />
                <Select
                  value={row.field}
                  onValueChange={(value) => updateRow(index, { field: value })}
                >
                  <SelectTrigger className="h-8 text-sm">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {block.props.rows.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground border rounded-md border-dashed">
              No rows added yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
