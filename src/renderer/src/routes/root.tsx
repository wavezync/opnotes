import { NavLink, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { cn } from '@renderer/lib/utils'

const NavLinkComponent = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        cn(
          'text-secondary-foreground text-sm underline-offset-4 hover:underline cursor-pointer hover:bg-primary/10 p-2 rounded-lg',
          isActive && 'bg-primary/10',
          isPending && 'bg-primary/20'
        )
      }
    >
      {children}
    </NavLink>
  )
}

export default function Root() {
  return (
    <main className="h-screen w-full flex flex-col antialiased bg-background overflow-hidden">
      <nav className="flex w-full space-x-2 text-2xl justify-start items-start p-1 text-left m-1 border-b-2">
        <NavLinkComponent to="/">Home</NavLinkComponent>
        <NavLinkComponent to="/patients">Patients</NavLinkComponent>
        <NavLinkComponent to="/surgeries">Surgeries</NavLinkComponent>
        <NavLinkComponent to="/doctors">Doctors</NavLinkComponent>
      </nav>
      <div className="grow m-1 p-3 overflow-y-auto">
        <Outlet />
        <Toaster position="bottom-right" />
      </div>
    </main>
  )
}
