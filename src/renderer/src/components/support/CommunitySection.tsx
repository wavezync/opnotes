import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { MessageCircle, Bell, HelpCircle, Users, ExternalLink } from 'lucide-react'

export const CommunitySection = () => {
  const benefits = [
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Latest Updates',
      description: 'Be the first to know about new releases and features.',
      color: 'blue'
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: 'Quick Support',
      description: 'Get help from the team and experienced users.',
      color: 'emerald'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Connect',
      description: 'Network with healthcare professionals worldwide.',
      color: 'violet'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-1">Join Our Community</h2>
        <p className="text-sm text-muted-foreground">
          Connect with other Op Notes users and the WaveZync team.
        </p>
      </div>

      {/* WhatsApp Hero */}
      <Card
        className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardContent className="pt-8 pb-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="flex flex-col items-center text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-105">
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp Community</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Join our active WhatsApp community to get instant support, share feedback,
              and connect with healthcare professionals using Op Notes.
            </p>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              onClick={() => window.open('https://chat.whatsapp.com/L4LMwxsbjPk514I1ToRris', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Join WhatsApp Community
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benefits.map((benefit, index) => {
          const colorClasses = getColorClasses(benefit.color)
          return (
            <Card
              key={benefit.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              <CardContent className="pt-5 pb-5 text-center">
                <div
                  className={`h-10 w-10 rounded-lg ${colorClasses.bg} flex items-center justify-center mx-auto mb-3`}
                >
                  <div className={colorClasses.text}>{benefit.icon}</div>
                </div>
                <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Community Guidelines */}
      <div
        className="text-center text-xs text-muted-foreground animate-fade-in-up"
        style={{ animationDelay: '250ms' }}
      >
        <p>
          Our community is a friendly, respectful space for healthcare professionals.
          Please be kind and helpful to fellow members.
        </p>
      </div>
    </div>
  )
}
