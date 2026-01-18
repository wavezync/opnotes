import { NavLink } from 'react-router-dom'
import { cn } from '@renderer/lib/utils'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserCog,
  Settings
} from 'lucide-react'
import opNotesLogo from '@renderer/assets/opnotes-logo.png'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl transition-all duration-150',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const mainNavItems = [
    { to: '/', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Home', end: true },
    { to: '/patients', icon: <Users className="h-5 w-5" />, label: 'Patients' },
    { to: '/surgeries', icon: <Stethoscope className="h-5 w-5" />, label: 'Surgeries' },
    { to: '/doctors', icon: <UserCog className="h-5 w-5" />, label: 'Doctors' }
  ]

  return (
    <aside className="flex flex-col w-[88px] bg-sidebar-background border-r border-sidebar-border">
      {/* OpNotes Logo */}
      <div className="flex flex-col items-center justify-center gap-1 py-3 border-b border-sidebar-border">
        <img src={opNotesLogo} alt="OpNotes" className="h-8 w-8 rounded-lg" />
        <span className="text-[10px] font-semibold text-sidebar-foreground">OpNotes</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-4 px-2">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            end={item.end}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center py-4 px-2 border-t border-sidebar-border">
        <NavItem
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
        />
      </div>
    </aside>
  )
}
