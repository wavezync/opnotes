import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  Bug,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  ListChecks,
  Camera
} from 'lucide-react'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { useState } from 'react'

export const ReportIssue = () => {
  const { appVersion } = useSettings()
  const [copied, setCopied] = useState(false)

  const copyVersion = () => {
    navigator.clipboard.writeText(`Op Notes v${appVersion}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const beforeReportingItems = [
    { icon: <RefreshCw className="h-4 w-4" />, text: 'Try restarting the application' },
    { icon: <ListChecks className="h-4 w-4" />, text: 'Check if the issue still occurs' },
    { icon: <Camera className="h-4 w-4" />, text: 'Take screenshots if possible' }
  ]

  const includeItems = [
    'Steps to reproduce the issue',
    'What you expected to happen',
    'What actually happened',
    'Screenshots or screen recordings',
    'Your operating system (Windows, macOS, Linux)'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-1">Report an Issue</h2>
        <p className="text-sm text-muted-foreground">
          Found a bug? Let us know so we can fix it and improve Op Notes for everyone.
        </p>
      </div>

      {/* Before Reporting */}
      <Card
        className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border-amber-500/20 animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-sm font-medium">Before You Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {beforeReportingItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-amber-500">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* What to Include */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-medium">What to Include</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {includeItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Current Version</p>
              <p className="font-mono text-sm font-medium">Op Notes v{appVersion}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyVersion}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Button
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          onClick={() => window.open('https://github.com/wavezync/opnotes/issues/new?template=bug_report.yml', '_blank')}
        >
          <Bug className="h-4 w-4 mr-2" />
          Report Issue on GitHub
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          <MessageCircle className="h-3 w-3 inline-block mr-1" />
          Prefer chat? Join our{' '}
          <button
            onClick={() => window.open('https://chat.whatsapp.com/YOUR_INVITE_LINK', '_blank')}
            className="text-green-500 hover:underline"
          >
            WhatsApp Community
          </button>
        </p>
      </div>
    </div>
  )
}
