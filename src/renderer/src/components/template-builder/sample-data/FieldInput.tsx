import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select'
import { cn } from '../../../lib/utils'
import type { InputHTMLAttributes } from 'react'

interface FieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string
  value: string | number | null | undefined
  onChange: (value: string) => void
  mono?: boolean
  className?: string
}

export const FieldInput = ({
  label,
  value,
  onChange,
  mono,
  className,
  ...props
}: FieldInputProps) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </label>
    <Input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('h-7 text-xs', mono && 'font-mono')}
      {...props}
    />
  </div>
)

interface FieldTextareaProps {
  label: string
  value: string | null | undefined
  onChange: (value: string) => void
  rows?: number
  className?: string
}

export const FieldTextarea = ({
  label,
  value,
  onChange,
  rows = 2,
  className
}: FieldTextareaProps) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </label>
    <Textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="text-xs resize-none min-h-0"
    />
  </div>
)

interface SelectOption {
  value: string
  label: string
}

interface FieldSelectProps {
  label: string
  value: string | null | undefined
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const FieldSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className
}: FieldSelectProps) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </label>
    <Select value={value ?? ''} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

interface FieldDateProps {
  label: string
  value: string | null | undefined
  onChange: (value: string) => void
  className?: string
}

export const FieldDate = ({ label, value, onChange, className }: FieldDateProps) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </label>
    <Input
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 text-xs"
    />
  </div>
)

interface FieldNumberProps {
  label: string
  value: number | null | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export const FieldNumber = ({
  label,
  value,
  onChange,
  min,
  max,
  className
}: FieldNumberProps) => (
  <div className={cn('space-y-1', className)}>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      {label}
    </label>
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      min={min}
      max={max}
      className="h-7 text-xs"
    />
  </div>
)
