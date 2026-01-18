import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings, FileText, HardDrive, Building2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { GeneralSettings } from '@renderer/components/settings/GeneralSettings'
import { TemplatesSettings } from '@renderer/components/settings/TemplatesSettings'
import { BackupSettings } from '@renderer/components/settings/BackupSettings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'

type SettingsSection = 'general' | 'templates' | 'backup'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  description: string
  isActive: boolean
  onClick: () => void
  color: string
}

const NavItem = ({ icon, label, description, isActive, onClick, color }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 w-full px-3 py-3 text-left rounded-xl transition-all duration-200',
      isActive
        ? 'bg-accent shadow-sm'
        : 'hover:bg-accent/50'
    )}
  >
    <div
      className={cn(
        'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
        isActive ? color : 'bg-muted'
      )}
    >
      <div className={cn(isActive ? 'text-white' : 'text-muted-foreground')}>{icon}</div>
    </div>
    <div className="min-w-0">
      <div
        className={cn(
          'text-sm font-medium truncate',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </div>
      <div className="text-xs text-muted-foreground truncate">{description}</div>
    </div>
  </button>
)

export const SettingsIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()

  const tabParam = searchParams.get('tab')
  const activeSection: SettingsSection =
    tabParam === 'templates' ? 'templates' : tabParam === 'backup' ? 'backup' : 'general'

  const setActiveSection = (section: SettingsSection) => {
    setSearchParams(section === 'general' ? {} : { tab: section })
  }

  useEffect(() => {
    setBreadcrumbs([{ label: 'Settings', to: '/settings' }])
  }, [setBreadcrumbs])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center border border-slate-500/20">
          <Settings className="h-6 w-6 text-slate-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage application preferences and configurations
          </p>
        </div>
      </div>

      {/* Desktop layout with sidebar */}
      <div className="hidden md:flex gap-6 flex-1 min-h-0">
        <nav
          className="w-56 flex-shrink-0 animate-fade-in-up"
          style={{ animationDelay: '50ms' }}
        >
          <div className="space-y-1">
            <NavItem
              icon={<Building2 className="h-4 w-4" />}
              label="General"
              description="Hospital info"
              isActive={activeSection === 'general'}
              onClick={() => setActiveSection('general')}
              color="bg-blue-500"
            />
            <NavItem
              icon={<FileText className="h-4 w-4" />}
              label="Templates"
              description="Surgery templates"
              isActive={activeSection === 'templates'}
              onClick={() => setActiveSection('templates')}
              color="bg-violet-500"
            />
            <NavItem
              icon={<HardDrive className="h-4 w-4" />}
              label="Backup"
              description="Data backup"
              isActive={activeSection === 'backup'}
              onClick={() => setActiveSection('backup')}
              color="bg-emerald-500"
            />
          </div>
        </nav>
        <div
          className="flex-1 min-w-0 overflow-y-auto animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'templates' && <TemplatesSettings />}
          {activeSection === 'backup' && <BackupSettings />}
        </div>
      </div>

      {/* Mobile layout with tabs */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto">
        <Tabs
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as SettingsSection)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              <Building2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex-1">
              <HardDrive className="h-4 w-4 mr-2" />
              Backup
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="templates">
            <TemplatesSettings />
          </TabsContent>
          <TabsContent value="backup">
            <BackupSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
