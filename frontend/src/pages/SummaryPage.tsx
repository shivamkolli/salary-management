import { useEffect, useState } from 'react'
import { getAnalyticsSummary } from '../api/analytics'
import { ApiError } from '../api/client'
import type { AnalyticsSummary } from '../types/analytics'
import './SummaryPage.css'

export function SummaryPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      setLoading(true)
      setError('')

      try {
        const response = await getAnalyticsSummary()
        if (!cancelled) setSummary(response.summary)
      } catch (requestError) {
        if (!cancelled) setError(summaryErrorMessage(requestError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [retryCount])

  if (loading) {
    return <p className="summary-message" role="status">Loading summary…</p>
  }

  if (error || !summary) {
    return (
      <div className="summary-message summary-message--error" role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
          Retry
        </button>
      </div>
    )
  }

  const departments = Object.entries(summary.employees_by_department)

  return (
    <section className="summary-page" aria-labelledby="summary-heading">
      <header className="page-heading">
        <p className="eyebrow">Overview</p>
        <h1 id="summary-heading">Organization summary</h1>
        <p>Active employee and department headcount.</p>
      </header>

      <div className="summary-cards">
        <article className="summary-card">
          <p>Active employees</p>
          <strong>{summary.active_employee_count.toLocaleString()}</strong>
        </article>
        <article className="summary-card">
          <p>Departments</p>
          <strong>{summary.total_departments.toLocaleString()}</strong>
        </article>
      </div>

      <section className="department-summary" aria-labelledby="department-summary-heading">
        <div className="department-summary__heading">
          <p className="eyebrow">Workforce</p>
          <h2 id="department-summary-heading">Employees by department</h2>
        </div>

        {departments.length === 0 ? (
          <p className="summary-message">No active departments found.</p>
        ) : (
          <table className="department-table">
            <thead>
              <tr>
                <th scope="col">Department</th>
                <th scope="col">Employees</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(([department, employeeCount]) => (
                <tr key={department}>
                  <td>{department}</td>
                  <td>{employeeCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  )
}

function summaryErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return 'Unable to connect to the server. Check your connection and try again.'
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'The summary service is temporarily unavailable. Try again shortly.'
  }

  return 'Unable to load organization summary.'
}
