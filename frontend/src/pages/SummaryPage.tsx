import { useEffect, useState } from 'react'
import { getAnalyticsSummary } from '../api/analytics'
import { ApiError } from '../api/client'
import type { AnalyticsSummary } from '../types/analytics'
import './SummaryPage.css'

function formatSalary(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

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
  const monthlySalaries = Object.entries(summary.monthly_salary_by_currency)

  return (
    <section className="summary-page" aria-labelledby="summary-heading">
      <header className="page-heading">
        <p className="eyebrow">Overview</p>
        <h1 id="summary-heading">Organization summary</h1>
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

      <section className="salary-summary" aria-labelledby="monthly-salary-heading">
        <div className="salary-summary__heading">
          <div>
            <p className="eyebrow">Compensation</p>
            <h2 id="monthly-salary-heading">Estimated monthly salary by currency</h2>
          </div>
          <p>Current annual salaries divided by 12</p>
        </div>

        {monthlySalaries.length === 0 ? (
          <p className="salary-summary__empty">No current salary data available.</p>
        ) : (
          <div className="currency-cards">
            {monthlySalaries.map(([currency, amount]) => (
              <article
                className="currency-card"
                key={currency}
                aria-label={`${currency} estimated monthly salary`}
              >
                <span>{currency}</span>
                <strong>{formatSalary(amount, currency)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>

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
