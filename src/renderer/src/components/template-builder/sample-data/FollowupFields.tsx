import { useSampleData } from '../SampleDataContext'
import { FieldDate } from './FieldInput'

export const FollowupFields = () => {
  const { sampleContext, updateField, templateType } = useSampleData()
  const followup = sampleContext.followup

  if (templateType !== 'followup' || !followup) {
    return (
      <div className="flex items-center justify-center py-6">
        <p className="text-xs text-muted-foreground">
          Follow-up fields are only available for follow-up templates.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <FieldDate
        label="Follow-up Date"
        value={followup.date}
        onChange={(v) => updateField('followup.date', v)}
      />
      <p className="text-[10px] text-muted-foreground">
        Follow-up notes use sample HTML content for preview.
      </p>
    </div>
  )
}
