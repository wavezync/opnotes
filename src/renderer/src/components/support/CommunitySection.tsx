import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { MessageCircle, Bell, HelpCircle, Users, ExternalLink, Sparkles } from 'lucide-react'
import { EXTERNAL_LINKS } from '@shared/constants/links'
import whatsappQr from '../../../../../resources/whatsapp-qr.png?asset'

export const CommunitySection = () => {
  const benefits = [
    {
      icon: <Bell className="h-4 w-4" />,
      title: 'Latest Updates',
      description: 'New releases & features'
    },
    {
      icon: <HelpCircle className="h-4 w-4" />,
      title: 'Quick Support',
      description: 'Help from the team'
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: 'Connect',
      description: 'Healthcare professionals'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold mb-1">Join Our Community</h2>
        <p className="text-sm text-muted-foreground">
          Connect with other Op Notes users and the WaveZync team.
        </p>
      </div>

      {/* Main Community Card */}
      <Card
        className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Main Content */}
            <div className="flex-1 p-6">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Active Community
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">WhatsApp Community</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Join our active WhatsApp community to get instant support, share feedback, and
                connect with healthcare professionals using Op Notes.
              </p>

              {/* QR + Button row */}
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-green-500/10">
                    <img src={whatsappQr} alt="WhatsApp QR Code" className="w-20 h-20" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">Scan to join</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                    onClick={() => window.open(EXTERNAL_LINKS.WHATSAPP_COMMUNITY, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Join Community
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground">Or scan QR code</p>
                </div>
              </div>
            </div>

            {/* Right Section - Benefits */}
            <div className="w-full md:w-56 flex-shrink-0 bg-gradient-to-b from-green-500/5 to-emerald-500/10 border-t md:border-t-0 md:border-l border-green-500/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-green-600" />
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Why Join?
                </h4>
              </div>
              <div className="flex flex-row md:flex-col gap-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-3 flex-1 md:flex-none animate-fade-in-up"
                    style={{ animationDelay: `${(index + 2) * 50}ms` }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-white/80 dark:bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-green-600">{benefit.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-sm font-medium">{benefit.title}</h5>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <div
        className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-fade-in-up"
        style={{ animationDelay: '250ms' }}
      >
        <Users className="h-3.5 w-3.5" />
        <p>
          A friendly, respectful space for healthcare professionals. Be kind and helpful to fellow
          members.
        </p>
      </div>
    </div>
  )
}
