import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  Stethoscope,
  Users,
  Shield,
  Code,
  ExternalLink,
  FileText,
  Printer,
  FolderSearch
} from 'lucide-react'
import opNotesLogo from '@renderer/assets/opnotes-logo.png'
import wavezyncLogoDark from '../../../../../resources/wavezync-dark.png?asset'
import wavezyncLogoLight from '../../../../../resources/wavezync-light.png?asset'
import { useTheme } from '@renderer/contexts/ThemeContext'
import { useSettings } from '@renderer/contexts/SettingsContext'

export const AboutWaveZync = () => {
  const { theme } = useTheme()
  const { appVersion } = useSettings()
  const wavezyncLogo = theme.mode === 'light' ? wavezyncLogoLight : wavezyncLogoDark

  const features = [
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: 'Surgery Management',
      description: 'Create detailed surgical notes with procedures, findings, and follow-ups.',
      color: 'rose'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Patient Records',
      description: 'Organize patient information with BHT numbers, demographics, and history.',
      color: 'blue'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Templates',
      description: 'Save time with reusable templates for common surgical procedures.',
      color: 'amber'
    },
    {
      icon: <Printer className="h-5 w-5" />,
      title: 'Print Reports',
      description: 'Generate professional BHT reports ready for patient files.',
      color: 'violet'
    },
    {
      icon: <FolderSearch className="h-5 w-5" />,
      title: 'Quick Search',
      description: 'Find any patient or surgery instantly with full-text search.',
      color: 'emerald'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Privacy First',
      description: 'All data stays on your computer. No cloud, no tracking.',
      color: 'slate'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-500' }
    }
    return colors[color] || colors.rose
  }

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 border-rose-500/20 overflow-hidden animate-fade-in-up">
        <CardContent className="pt-8 pb-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="flex flex-col items-center text-center relative">
            <img
              src={opNotesLogo}
              alt="Op Notes"
              className="h-16 w-16 rounded-2xl shadow-lg mb-4 transition-transform duration-200 hover:scale-105"
            />
            <h2 className="text-xl font-bold mb-2">Op Notes</h2>
            <p className="text-muted-foreground max-w-md">
              A free, open-source surgical notes management application for hospitals.
              Manage patients, document surgeries, and print professional reports.
            </p>
            {appVersion && (
              <span className="mt-3 text-xs text-muted-foreground/70 font-mono">
                Version {appVersion}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => {
          const colorClasses = getColorClasses(feature.color)
          return (
            <Card
              key={feature.title}
              className="animate-fade-in-up transition-all duration-200 hover:shadow-md"
              style={{ animationDelay: `${(index + 1) * 50}ms` }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg ${colorClasses.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <div className={colorClasses.text}>{feature.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Links */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://github.com/wavezync/opnotes', '_blank')}
          >
            <Code className="h-4 w-4 mr-2" />
            View Source on GitHub
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </Button>
        </CardContent>
      </Card>

      {/* WaveZync Attribution */}
      <div
        className="flex flex-col items-center gap-2 pt-2 animate-fade-in-up"
        style={{ animationDelay: '400ms' }}
      >
        <span className="text-xs text-muted-foreground">Made by</span>
        <button
          onClick={() => window.open('https://wavezync.com', '_blank')}
          className="opacity-50 hover:opacity-80 transition-opacity"
        >
          <img src={wavezyncLogo} alt="WaveZync" className="h-5" />
        </button>
      </div>
    </div>
  )
}
