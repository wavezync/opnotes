import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { AppLayout } from '@renderer/layouts/AppLayout'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings, FileText, HardDrive } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { GeneralSettings } from '@renderer/components/settings/GeneralSettings'
import { TemplatesSettings } from '@renderer/components/settings/TemplatesSettings'
import { BackupSettings } from '@renderer/components/settings/BackupSettings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'

type SettingsSection = 'general' | 'templates' | 'backup'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
      isActive
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
    )}
  >
    {icon}
    {label}
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
    <AppLayout title="Settings">
      {/* Desktop layout with sidebar */}
      <div className="hidden md:flex gap-6">
        <nav className="w-48 flex-shrink-0">
          <div className="space-y-1">
            <NavItem
              icon={<Settings className="h-4 w-4" />}
              label="General"
              isActive={activeSection === 'general'}
              onClick={() => setActiveSection('general')}
            />
            <NavItem
              icon={<FileText className="h-4 w-4" />}
              label="Templates"
              isActive={activeSection === 'templates'}
              onClick={() => setActiveSection('templates')}
            />
            <NavItem
              icon={<HardDrive className="h-4 w-4" />}
              label="Backup"
              isActive={activeSection === 'backup'}
              onClick={() => setActiveSection('backup')}
            />
          </div>
        </nav>
        <div className="flex-1 min-w-0">
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'templates' && <TemplatesSettings />}
          {activeSection === 'backup' && <BackupSettings />}
        </div>
      </div>

      {/* Mobile layout with tabs */}
      <div className="md:hidden">
        <Tabs
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as SettingsSection)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
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
    </AppLayout>
  )
}
