import { NavLink } from 'react-router-dom'
import { cn } from '@renderer/lib/utils'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserCog,
  ScrollText,
  HeartHandshake,
  Settings
} from 'lucide-react'
import opNotesLogo from '@renderer/assets/opnotes-logo.png'
import wavezyncLogoDark from '../../../../../resources/wavezync-dark.png?asset'
import wavezyncLogoLight from '../../../../../resources/wavezync-light.png?asset'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { useTheme } from '@renderer/contexts/ThemeContext'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
  index?: number
}

function NavItem({ to, icon, label, end, index = 0 }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl transition-all duration-200 animate-fade-in-up',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-theme-md'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )
      }
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary-foreground rounded-r-full opacity-60" />
          )}
          <div className="transition-transform duration-200 group-hover:scale-110">
            {icon}
          </div>
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { appVersion } = useSettings()
  const { theme } = useTheme()
  const wavezyncLogo = theme.mode === 'light' ? wavezyncLogoLight : wavezyncLogoDark

  const mainNavItems = [
    { to: '/', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Home', end: true },
    { to: '/patients', icon: <Users className="h-5 w-5" />, label: 'Patients' },
    { to: '/surgeries', icon: <Stethoscope className="h-5 w-5" />, label: 'Surgeries' },
    { to: '/doctors', icon: <UserCog className="h-5 w-5" />, label: 'Doctors' },
    { to: '/activity', icon: <ScrollText className="h-5 w-5" />, label: 'Activity' }
  ]

  return (
    <aside className="flex flex-col w-[88px] bg-gradient-to-b from-sidebar-background to-sidebar-background/95 border-r border-sidebar-border">
      {/* OpNotes Logo */}
      <div className="flex flex-col items-center justify-center gap-1 py-3 border-b border-sidebar-border">
        <img
          src={opNotesLogo}
          alt="OpNotes"
          className="h-8 w-8 rounded-lg shadow-theme-sm transition-transform duration-200 hover:scale-105"
        />
        <span className="text-[10px] font-semibold text-sidebar-foreground">OpNotes</span>
        {appVersion && (
          <a
            href={`https://github.com/wavezync/opnotes/releases/tag/v${appVersion}`}
            target="_blank"
            rel="noreferrer"
            className="text-[9px] text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            v{appVersion}
          </a>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-4 px-2">
        {mainNavItems.map((item, index) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            end={item.end}
            index={index}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center py-4 px-2 border-t border-sidebar-border gap-1">
        <NavItem
          to="/support"
          icon={<HeartHandshake className="h-5 w-5" />}
          label="Support"
          index={mainNavItems.length}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          index={mainNavItems.length + 1}
        />
      </div>

      {/* WaveZync Attribution */}
      <a
        href="https://wavezync.com"
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col items-center gap-1 py-3 px-2 border-t border-sidebar-border/50 transition-all duration-300 hover:bg-sidebar-accent/30"
      >
        <img
          src={wavezyncLogo}
          alt="WaveZync"
          className="h-4 opacity-40 grayscale transition-all duration-300 group-hover:opacity-80 group-hover:grayscale-0"
        />
      </a>
    </aside>
  )
}
