import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode
} from 'react'
import { TemplateContext, TemplateType } from '../../../../shared/types/template-blocks'
import { useSettings } from '../../contexts/SettingsContext'
import { getSampleContext } from '../../lib/template-context'

type TabId = 'patient' | 'surgery' | 'followup' | 'settings'

interface SampleDataContextType {
  sampleContext: TemplateContext
  customData: Partial<TemplateContext>
  isEditorOpen: boolean
  activeTab: TabId
  usingRealSettings: boolean
  hasCustomizations: boolean
  templateType: TemplateType
  updateField: (path: string, value: unknown) => void
  resetToDefaults: () => void
  resetCategory: (category: TabId) => void
  toggleEditor: () => void
  setEditorOpen: (open: boolean) => void
  setActiveTab: (tab: TabId) => void
}

const SampleDataContext = createContext<SampleDataContextType | null>(null)

// Deep merge utility for TemplateContext
function deepMergeContext(
  target: TemplateContext,
  source: Partial<TemplateContext>
): TemplateContext {
  const result: TemplateContext = {
    patient: { ...target.patient },
    surgery: { ...target.surgery },
    settings: { ...target.settings },
    followup: target.followup ? { ...target.followup } : undefined
  }

  if (source.patient) {
    result.patient = { ...result.patient, ...source.patient }
  }
  if (source.surgery) {
    result.surgery = { ...result.surgery, ...source.surgery }
  }
  if (source.settings) {
    result.settings = { ...result.settings, ...source.settings }
  }
  if (source.followup) {
    result.followup = result.followup
      ? { ...result.followup, ...source.followup }
      : source.followup
  }

  return result
}

// Set nested value by path for TemplateContext
function setNestedValue(
  obj: Partial<TemplateContext>,
  path: string,
  value: unknown
): Partial<TemplateContext> {
  const keys = path.split('.')
  const result = { ...obj } as Record<string, unknown>

  let current: Record<string, unknown> = result
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    current[key] = { ...((current[key] as Record<string, unknown>) || {}) }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result as Partial<TemplateContext>
}

interface SampleDataProviderProps {
  templateType: TemplateType
  children: ReactNode
}

export const SampleDataProvider = ({ templateType, children }: SampleDataProviderProps) => {
  const { settings } = useSettings()

  const [customData, setCustomData] = useState<Partial<TemplateContext>>({})
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('patient')

  // Check if real settings are available
  const realSettings = useMemo(() => {
    const hospital = settings.hospital
    const subtitle = settings.subtitle
    const unit = settings.unit
    const telephone = settings.telephone

    return {
      hospital: hospital || null,
      subtitle: subtitle || null,
      unit: unit || null,
      telephone: telephone || null,
      hasAny: Boolean(hospital || unit || telephone)
    }
  }, [settings])

  // Get base sample context with real settings merged
  const baseSampleContext = useMemo(() => {
    const base = getSampleContext(templateType)

    // Merge real settings if available
    if (realSettings.hasAny) {
      return {
        ...base,
        settings: {
          hospital: realSettings.hospital || base.settings.hospital,
          subtitle: realSettings.subtitle || base.settings.subtitle,
          unit: realSettings.unit || base.settings.unit,
          telephone: realSettings.telephone || base.settings.telephone
        }
      }
    }

    return base
  }, [templateType, realSettings])

  // Merge custom data with base context
  const sampleContext = useMemo(() => {
    if (Object.keys(customData).length === 0) {
      return baseSampleContext
    }
    return deepMergeContext(baseSampleContext, customData)
  }, [baseSampleContext, customData])

  // Check if user has made customizations
  const hasCustomizations = useMemo(() => {
    return Object.keys(customData).length > 0
  }, [customData])

  const updateField = useCallback((path: string, value: unknown) => {
    setCustomData((prev) => setNestedValue(prev, path, value))
  }, [])

  const resetToDefaults = useCallback(() => {
    setCustomData({})
  }, [])

  const resetCategory = useCallback((category: TabId) => {
    setCustomData((prev) => {
      const next = { ...prev }
      delete next[category as keyof TemplateContext]
      return next
    })
  }, [])

  const toggleEditor = useCallback(() => {
    setIsEditorOpen((prev) => !prev)
  }, [])

  const contextValue = useMemo(
    () => ({
      sampleContext,
      customData,
      isEditorOpen,
      activeTab,
      usingRealSettings: realSettings.hasAny,
      hasCustomizations,
      templateType,
      updateField,
      resetToDefaults,
      resetCategory,
      toggleEditor,
      setEditorOpen: setIsEditorOpen,
      setActiveTab
    }),
    [
      sampleContext,
      customData,
      isEditorOpen,
      activeTab,
      realSettings.hasAny,
      hasCustomizations,
      templateType,
      updateField,
      resetToDefaults,
      resetCategory,
      toggleEditor
    ]
  )

  return (
    <SampleDataContext.Provider value={contextValue}>{children}</SampleDataContext.Provider>
  )
}

export const useSampleData = () => {
  const context = useContext(SampleDataContext)

  if (!context) {
    throw new Error('useSampleData must be used within a SampleDataProvider')
  }

  return context
}
