import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__content">
        <Link className="brand" to="/summary" aria-label="ACME Compensation home">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <rect x="3.5" y="5" width="17" height="14" rx="3" />
              <path d="m7.5 14.5 3-3 2.5 2.5 3.5-4" />
              <path d="M14.5 10h2v2" />
            </svg>
          </span>
          <span>
            <strong className="brand__name">ACME</strong>
            <span className="brand__product">Compensation</span>
          </span>
        </Link>

        <div className="current-user" aria-label="Current user: HR Manager">
          <span className="current-user__avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
            </svg>
          </span>
          <span className="user-role">HR Manager</span>
        </div>
      </div>
    </header>
  )
}
