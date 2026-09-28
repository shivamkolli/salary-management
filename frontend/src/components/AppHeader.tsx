import { NavLink } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <NavLink className="brand" to="/employees" aria-label="ACME Compensation home">
          <span className="brand__mark" aria-hidden="true">A</span>
          <span>
            <strong className="brand__name">ACME</strong>
            <span className="brand__product">Compensation</span>
          </span>
        </NavLink>

        <nav aria-label="Primary navigation">
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            to="/employees"
          >
            HR Manager
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
