import { Link, Outlet } from 'react-router-dom'

const NavLinkComponent = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="text-primary text-sm underline-offset-4 hover:underline cursor-pointer hover:bg-secondary/80 p-2 rounded-lg"
    >
      {children}
    </Link>
  )
}

export default function Root() {
  return (
    <main className="h-screen w-full flex flex-col antialiased bg-background overflow-hidden">
      <nav className="flex w-full space-x-2 text-2xl justify-start items-start p-1 text-left m-1 border-b-2">
        <NavLinkComponent to="/">Home</NavLinkComponent>
        <NavLinkComponent to="/new">Add</NavLinkComponent>
        <NavLinkComponent to="/search">Search</NavLinkComponent>
      </nav>
      <div className="grow m-1 p-3 overflow-y-auto">
        <Outlet />
      </div>
    </main>
  )
}
