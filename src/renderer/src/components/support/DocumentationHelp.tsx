import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  BookOpen,
  ExternalLink,
  Rocket,
  Users,
  Stethoscope,
  FileText,
  Printer,
  Keyboard,
  Wand2,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { queries } from '@renderer/lib/queries'

interface GuideCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  onClick?: () => void
}

const GuideCard = ({ icon, title, description, color, onClick }: GuideCardProps) => {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' }
  }

  const classes = colorClasses[color] || colorClasses.blue

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border bg-card hover:bg-accent/50 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${classes.bg} flex items-center justify-center flex-shrink-0`}>
          <div className={classes.text}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-0.5 group-hover:text-foreground transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </button>
  )
}

export const DocumentationHelp = () => {
  const queryClient = useQueryClient()

  const resetOnboardingMutation = useMutation({
    mutationFn: async () => {
      await window.api.invoke('updateSettings', [{ key: 'onboarding_completed', value: null }])
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.app.settings)
    }
  })

  const guides = [
    {
      icon: <Rocket className="h-5 w-5" />,
      title: 'Getting Started',
      description: 'Set up Op Notes for your hospital',
      color: 'blue'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Managing Patients',
      description: 'Add, search, and organize patient records',
      color: 'emerald'
    },
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: 'Surgery Records',
      description: 'Create and manage surgical notes',
      color: 'rose'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Using Templates',
      description: 'Create reusable surgery note templates',
      color: 'violet'
    },
    {
      icon: <Printer className="h-5 w-5" />,
      title: 'Printing Records',
      description: 'Print formatted BHT and surgery reports',
      color: 'amber'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-1">Documentation & Help</h2>
        <p className="text-sm text-muted-foreground">
          Learn how to get the most out of Op Notes.
        </p>
      </div>

      {/* Quick Start Guides */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-medium">Quick Start Guides</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {guides.map((guide, index) => (
            <GuideCard
              key={index}
              icon={guide.icon}
              title={guide.title}
              description={guide.description}
              color={guide.color}
              onClick={() => window.open('https://github.com/wavezync/opnotes/wiki', '_blank')}
            />
          ))}
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts & Setup Wizard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
                <p className="text-xs text-muted-foreground">Work faster with shortcuts</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://github.com/wavezync/opnotes/wiki/Keyboard-Shortcuts', '_blank')}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              View Shortcuts
            </Button>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wand2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Setup Wizard</h4>
                <p className="text-xs text-muted-foreground">Re-run the initial setup</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => resetOnboardingMutation.mutate()}
              disabled={resetOnboardingMutation.isPending}
            >
              {resetOnboardingMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Run Setup Wizard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* External Links */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            More Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://github.com/wavezync/opnotes/wiki', '_blank')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Full Documentation
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://github.com/wavezync/opnotes/releases', '_blank')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Release Notes
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
