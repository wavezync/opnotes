import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  Lightbulb,
  ExternalLink,
  MessageSquare,
  Zap,
  Target,
  Users
} from 'lucide-react'

export const RequestFeature = () => {
  const tips = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: 'Describe the Problem',
      description: 'What challenge are you facing that a new feature could solve?',
      color: 'blue'
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      title: 'Propose a Solution',
      description: 'Share your idea for how the feature might work.',
      color: 'amber'
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: 'Share the Impact',
      description: 'How would this help you and other healthcare professionals?',
      color: 'emerald'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' }
    }
    return colors[color] || colors.amber
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-1">Request a Feature</h2>
        <p className="text-sm text-muted-foreground">
          Have an idea to make Op Notes better? We would love to hear it.
        </p>
      </div>

      {/* Inspiration Card */}
      <Card
        className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-amber-500/20 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardContent className="pt-6 pb-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-start gap-4 relative">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Your Ideas Shape Op Notes</h3>
              <p className="text-sm text-muted-foreground">
                Every great feature starts with a user suggestion. Your workflow insights help us
                build tools that truly serve healthcare professionals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-violet-500" />
            </div>
            <CardTitle className="text-sm font-medium">Tips for a Great Request</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {tips.map((tip, index) => {
            const colorClasses = getColorClasses(tip.color)
            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`h-8 w-8 rounded-lg ${colorClasses.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <div className={colorClasses.text}>{tip.icon}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-0.5">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          onClick={() => window.open('https://github.com/wavezync/opnotes/issues/new?template=feature_request.yml', '_blank')}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Submit Feature Request
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open('https://github.com/wavezync/opnotes/discussions', '_blank')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Join GitHub Discussions
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </div>
  )
}
