import { useBreadcrumbs } from '@renderer/contexts/BreadcrumbContext'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeartHandshake, Info, Bug, Lightbulb, MessageCircle, BookOpen } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { AboutWaveZync } from '@renderer/components/support/AboutWaveZync'
import { ReportIssue } from '@renderer/components/support/ReportIssue'
import { RequestFeature } from '@renderer/components/support/RequestFeature'
import { CommunitySection } from '@renderer/components/support/CommunitySection'
import { DocumentationHelp } from '@renderer/components/support/DocumentationHelp'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'

type SupportSection = 'about' | 'report-issue' | 'request-feature' | 'community' | 'documentation'

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
      isActive ? 'bg-accent shadow-sm' : 'hover:bg-accent/50'
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

export const SupportIndex = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumbs()

  const tabParam = searchParams.get('tab')
  const activeSection: SupportSection =
    tabParam === 'report-issue'
      ? 'report-issue'
      : tabParam === 'request-feature'
        ? 'request-feature'
        : tabParam === 'community'
          ? 'community'
          : tabParam === 'documentation'
            ? 'documentation'
            : 'about'

  const setActiveSection = (section: SupportSection) => {
    setSearchParams(section === 'about' ? {} : { tab: section })
  }

  useEffect(() => {
    setBreadcrumbs([{ label: 'Support', to: '/support' }])
  }, [setBreadcrumbs])

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 flex items-center justify-center border border-rose-500/20">
          <HeartHandshake className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support & Community</h1>
          <p className="text-sm text-muted-foreground">
            Get help, report issues, and connect with the Op Notes community
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
              icon={<Info className="h-4 w-4" />}
              label="About"
              description="About Op Notes"
              isActive={activeSection === 'about'}
              onClick={() => setActiveSection('about')}
              color="bg-rose-500"
            />
            <NavItem
              icon={<Bug className="h-4 w-4" />}
              label="Report Issue"
              description="Report bugs"
              isActive={activeSection === 'report-issue'}
              onClick={() => setActiveSection('report-issue')}
              color="bg-red-500"
            />
            <NavItem
              icon={<Lightbulb className="h-4 w-4" />}
              label="Request Feature"
              description="Suggest ideas"
              isActive={activeSection === 'request-feature'}
              onClick={() => setActiveSection('request-feature')}
              color="bg-amber-500"
            />
            <NavItem
              icon={<MessageCircle className="h-4 w-4" />}
              label="Community"
              description="Join the chat"
              isActive={activeSection === 'community'}
              onClick={() => setActiveSection('community')}
              color="bg-green-500"
            />
            <NavItem
              icon={<BookOpen className="h-4 w-4" />}
              label="Documentation"
              description="Help & guides"
              isActive={activeSection === 'documentation'}
              onClick={() => setActiveSection('documentation')}
              color="bg-blue-500"
            />
          </div>
        </nav>
        <div
          className="flex-1 min-w-0 overflow-y-auto animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {activeSection === 'about' && <AboutWaveZync />}
          {activeSection === 'report-issue' && <ReportIssue />}
          {activeSection === 'request-feature' && <RequestFeature />}
          {activeSection === 'community' && <CommunitySection />}
          {activeSection === 'documentation' && <DocumentationHelp />}
        </div>
      </div>

      {/* Mobile layout with tabs */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto">
        <Tabs
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as SupportSection)}
        >
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="about" className="flex-1 min-w-[80px]">
              <Info className="h-4 w-4 mr-1" />
              About
            </TabsTrigger>
            <TabsTrigger value="report-issue" className="flex-1 min-w-[80px]">
              <Bug className="h-4 w-4 mr-1" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="request-feature" className="flex-1 min-w-[80px]">
              <Lightbulb className="h-4 w-4 mr-1" />
              Features
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-1 min-w-[80px]">
              <MessageCircle className="h-4 w-4 mr-1" />
              Community
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex-1 min-w-[80px]">
              <BookOpen className="h-4 w-4 mr-1" />
              Docs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-4">
            <AboutWaveZync />
          </TabsContent>
          <TabsContent value="report-issue" className="mt-4">
            <ReportIssue />
          </TabsContent>
          <TabsContent value="request-feature" className="mt-4">
            <RequestFeature />
          </TabsContent>
          <TabsContent value="community" className="mt-4">
            <CommunitySection />
          </TabsContent>
          <TabsContent value="documentation" className="mt-4">
            <DocumentationHelp />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
