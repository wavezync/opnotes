import { RotateCcw, X } from 'lucide-react'
import { useSampleData } from './SampleDataContext'
import { PatientFields, SurgeryFields, FollowupFields, SettingsFields } from './sample-data'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

type TabId = 'patient' | 'surgery' | 'followup' | 'settings'

interface Tab {
  id: TabId
  label: string
  showFor?: 'surgery' | 'followup' | 'all'
}

const TABS: Tab[] = [
  { id: 'patient', label: 'Patient', showFor: 'all' },
  { id: 'surgery', label: 'Surgery', showFor: 'all' },
  { id: 'followup', label: 'Follow-up', showFor: 'followup' },
  { id: 'settings', label: 'Settings', showFor: 'all' }
]

export const SampleDataEditor = () => {
  const {
    activeTab,
    setActiveTab,
    resetToDefaults,
    hasCustomizations,
    templateType,
    setEditorOpen
  } = useSampleData()

  // Filter tabs based on template type
  const visibleTabs = TABS.filter(
    (tab) => tab.showFor === 'all' || tab.showFor === templateType
  )

  const handleClose = () => {
    setEditorOpen(false)
  }

  return (
    <div className="flex-shrink-0 border-b border-border/50 bg-muted/50">
      {/* Header with tabs and actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
        <div className="flex items-center gap-0.5">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-2.5 py-1 text-[11px] rounded transition-colors',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5">
          {hasCustomizations && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
            title="Close"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Field editors - fixed height with scroll */}
      <div className="h-[200px] overflow-y-auto overflow-x-hidden">
        <div className="p-3">
          {activeTab === 'patient' && <PatientFields />}
          {activeTab === 'surgery' && <SurgeryFields />}
          {activeTab === 'followup' && <FollowupFields />}
          {activeTab === 'settings' && <SettingsFields />}
        </div>
      </div>
    </div>
  )
}
