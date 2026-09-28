import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getEmployee } from '../api/employees'
import type { EmployeeDetails as EmployeeDetailsData } from '../types/employee'
import './EmployeeDetails.css'

function formatMoney(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

function formatDate(value: string) {
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00Z`)

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date)
}

export function EmployeeDetails() {
  const { id } = useParams()
  const employeeId = Number(id)
  const hasValidEmployeeId = Number.isInteger(employeeId) && employeeId > 0
  const [employee, setEmployee] = useState<EmployeeDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    if (!hasValidEmployeeId) return

    async function loadEmployee() {
      setLoading(true)
      setError('')

      try {
        const response = await getEmployee(employeeId)
        if (!cancelled) setEmployee(response.employee)
      } catch (requestError) {
        if (!cancelled) {
          const message = requestError instanceof ApiError && requestError.status === 404
            ? 'Employee not found.'
            : 'Unable to load employee details.'

          setEmployee(null)
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadEmployee()

    return () => {
      cancelled = true
    }
  }, [employeeId, hasValidEmployeeId])

  if (!hasValidEmployeeId) {
    return (
      <div className="detail-message" role="alert">
        <p>Employee not found.</p>
        <Link className="button-link" to="/employees">Back to employees</Link>
      </div>
    )
  }

  if (loading) {
    return <p className="detail-message" role="status">Loading employee…</p>
  }

  if (error || !employee) {
    return (
      <div className="detail-message" role="alert">
        <p>{error || 'Employee not found.'}</p>
        <Link className="button-link" to="/employees">Back to employees</Link>
      </div>
    )
  }

  const fullName = `${employee.first_name} ${employee.last_name}`
  const initials = `${employee.first_name[0] ?? ''}${employee.last_name[0] ?? ''}`

  return (
    <section className="employee-details" aria-labelledby="employee-name">
      <Link className="back-link" to="/employees">← Back to employees</Link>

      <header className="employee-profile">
        <div className="employee-avatar" aria-hidden="true">{initials}</div>
        <div>
          <div className="profile-title-row">
            <h1 id="employee-name">{fullName}</h1>
            <span className={`status-badge${employee.active ? ' status-badge--active' : ''}`}>
              {employee.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p>{employee.job_title} · {employee.department}</p>
          <p className="employee-reference">{employee.employee_number} · {employee.email}</p>
        </div>
      </header>

      <div className="detail-grid">
        <section className="detail-card salary-card" aria-labelledby="current-salary-heading">
          <p className="eyebrow">Compensation</p>
          <h2 id="current-salary-heading">Current annual salary</h2>
          {employee.current_salary ? (
            <p className="salary-amount">{formatMoney(employee.current_salary, employee.currency)}</p>
          ) : (
            <p className="salary-empty">No salary recorded</p>
          )}
          <p className="salary-currency">Paid in {employee.currency}</p>
        </section>

        <section className="detail-card" aria-labelledby="employment-heading">
          <p className="eyebrow">Profile</p>
          <h2 id="employment-heading">Employment details</h2>
          <dl className="employment-list">
            <div>
              <dt>Country</dt>
              <dd>{employee.country}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd className="capitalize">{employee.level}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{formatDate(employee.joined_date)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="history-card" aria-labelledby="salary-history-heading">
        <div className="history-heading">
          <div>
            <p className="eyebrow">Record</p>
            <h2 id="salary-history-heading">Salary history</h2>
          </div>
          <p>{employee.salary_revisions.length} revisions</p>
        </div>

        {employee.salary_revisions.length === 0 ? (
          <p className="history-empty">No salary history has been recorded.</p>
        ) : (
          <div className="history-table-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th scope="col">Effective date</th>
                  <th scope="col">Annual salary</th>
                  <th scope="col">Reason</th>
                  <th scope="col">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {employee.salary_revisions.map((revision) => (
                  <tr key={revision.id}>
                    <td>{formatDate(revision.effective_from)}</td>
                    <td className="history-amount">
                      {formatMoney(revision.base_salary, employee.currency)}
                    </td>
                    <td>{revision.reason}</td>
                    <td>{formatDate(revision.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
