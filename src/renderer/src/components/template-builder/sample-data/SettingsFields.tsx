import { CheckCircle2 } from 'lucide-react'
import { useSampleData } from '../SampleDataContext'
import { FieldInput } from './FieldInput'

export const SettingsFields = () => {
  const { sampleContext, updateField, usingRealSettings } = useSampleData()
  const { settings } = sampleContext

  return (
    <div className="space-y-2">
      {/* Real settings indicator */}
      {usingRealSettings && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Using your configured hospital settings
          </span>
        </div>
      )}

      {/* Hospital Name */}
      <FieldInput
        label="Hospital Name"
        value={settings.hospital}
        onChange={(v) => updateField('settings.hospital', v)}
      />

      {/* Subtitle */}
      <FieldInput
        label="Subtitle"
        value={settings.subtitle}
        onChange={(v) => updateField('settings.subtitle', v)}
      />

      {/* Unit, Telephone */}
      <div className="grid grid-cols-2 gap-2">
        <FieldInput
          label="Unit / Department"
          value={settings.unit}
          onChange={(v) => updateField('settings.unit', v)}
        />
        <FieldInput
          label="Telephone"
          value={settings.telephone}
          onChange={(v) => updateField('settings.telephone', v)}
        />
      </div>

      {/* Note */}
      {!usingRealSettings && (
        <p className="text-[10px] text-muted-foreground pt-1">
          Configure hospital details in Settings to use real values by default.
        </p>
      )}
    </div>
  )
}
