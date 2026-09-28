import { NavLink } from 'react-router-dom'

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
}

export function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-navigation" aria-label="Main navigation">
        <NavLink className={sidebarLinkClass} to="/summary">
          Summary
        </NavLink>
        <NavLink className={sidebarLinkClass} to="/employees">
          Employees
        </NavLink>
      </nav>
    </aside>
  )
}
