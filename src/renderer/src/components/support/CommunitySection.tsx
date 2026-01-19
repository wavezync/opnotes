import { Card, CardContent } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import {
  MessageCircle,
  Bell,
  HelpCircle,
  Users,
  ExternalLink,
  MessageSquare,
  Newspaper,
  Lightbulb,
  Radio
} from 'lucide-react'
import { EXTERNAL_LINKS } from '@shared/constants/links'
import whatsappCommunityQr from '../../../../../resources/whatsapp-qr.png?asset'
import whatsappChannelQr from '../../../../../resources/whatsapp-channel-qr.png?asset'

export const CommunitySection = () => {
  const communityBenefits = [
    {
      icon: <HelpCircle className="h-4 w-4" />,
      title: 'Quick Support',
      description: 'Get instant help from the team'
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: 'Share Feedback',
      description: 'Help shape the app'
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: 'Connect',
      description: 'With healthcare peers'
    }
  ]

  const channelBenefits = [
    {
      icon: <Newspaper className="h-4 w-4" />,
      title: 'Release Notes',
      description: 'New version announcements'
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: 'New Features',
      description: 'Feature highlights'
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      title: 'Tips & Guides',
      description: 'Get more from Op Notes'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up text-center">
        <h2 className="text-lg font-semibold mb-1">Connect With Us</h2>
        <p className="text-sm text-muted-foreground">
          Join our community for support or follow our channel for updates.
        </p>
      </div>

      {/* Dual Card Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Community Card - Green/Emerald */}
        <Card
          className="relative bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-500/20 overflow-hidden animate-fade-in-up h-full"
          style={{ animationDelay: '50ms' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <CardContent className="p-0 relative">
            <div className="flex flex-col md:flex-row">
              {/* Left Section - Content */}
              <div className="flex-1 p-6">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center shadow-sm">
                    <MessageCircle className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Community
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1">WhatsApp Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant support & connect with peers
                </p>

                {/* Benefits */}
                <div className="space-y-2.5">
                  {communityBenefits.map((benefit, index) => (
                    <div
                      key={benefit.title}
                      className="flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 2) * 50}ms` }}
                    >
                      <div className="h-7 w-7 rounded-lg bg-white/80 dark:bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-emerald-600">{benefit.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{benefit.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {benefit.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Section - QR Code & Button */}
              <div className="w-full md:w-52 flex-shrink-0 bg-gradient-to-b md:bg-gradient-to-br from-emerald-500/5 to-green-500/10 border-t md:border-t-0 md:border-l border-emerald-500/10 p-5 flex flex-col items-center justify-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-lg ring-1 ring-emerald-500/20">
                  <img src={whatsappCommunityQr} alt="Community QR Code" className="w-32 h-32" />
                </div>
                <p className="text-xs text-muted-foreground text-center">Scan with your phone</p>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-sm w-full"
                  onClick={() => window.open(EXTERNAL_LINKS.WHATSAPP_COMMUNITY, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Card - Cyan/Blue */}
        <Card
          className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-sky-500/10 border-cyan-500/20 overflow-hidden animate-fade-in-up h-full"
          style={{ animationDelay: '100ms' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <CardContent className="p-0 relative">
            <div className="flex flex-col md:flex-row">
              {/* Left Section - Content */}
              <div className="flex-1 p-6">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shadow-sm">
                    <Radio className="h-4.5 w-4.5 text-cyan-600" />
                  </div>
                  <span className="text-xs font-medium text-cyan-600 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                    Updates
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-1">Updates Channel</h3>
                <p className="text-sm text-muted-foreground mb-4">Never miss an important update</p>

                {/* Benefits */}
                <div className="space-y-2.5">
                  {channelBenefits.map((benefit, index) => (
                    <div
                      key={benefit.title}
                      className="flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 3) * 50}ms` }}
                    >
                      <div className="h-7 w-7 rounded-lg bg-white/80 dark:bg-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-cyan-600">{benefit.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{benefit.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {benefit.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Section - QR Code & Button */}
              <div className="w-full md:w-52 flex-shrink-0 bg-gradient-to-b md:bg-gradient-to-br from-cyan-500/5 to-blue-500/10 border-t md:border-t-0 md:border-l border-cyan-500/10 p-5 flex flex-col items-center justify-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-lg ring-1 ring-cyan-500/20">
                  <img src={whatsappChannelQr} alt="Channel QR Code" className="w-32 h-32" />
                </div>
                <p className="text-xs text-muted-foreground text-center">Scan with your phone</p>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-sm w-full"
                  onClick={() => window.open(EXTERNAL_LINKS.WHATSAPP_CHANNEL, '_blank')}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Follow
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
