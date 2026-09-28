import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { getEmployees } from '../api/employees'
import type { Employee, Pagination } from '../types/employee'
import './EmployeeDirectory.css'

const departments = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
  'Sales',
]

const countries = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
]

const currencies = ['INR', 'USD', 'EUR', 'GBP']

export function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [department, setDepartment] = useState('')
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadEmployees() {
      setLoading(true)
      setError('')

      try {
        const response = await getEmployees({ page, search, country, department, currency })

        if (!cancelled) {
          setEmployees(response.employees)
          setPagination(response.pagination)
        }
      } catch (requestError) {
        if (!cancelled) {
          setEmployees([])
          setPagination(null)
          setError(employeeErrorMessage(requestError))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadEmployees()

    return () => {
      cancelled = true
    }
  }, [country, currency, department, page, retryCount, search])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setCountry('')
    setDepartment('')
    setCurrency('')
    setPage(1)
  }

  const hasFilters = Boolean(search || country || department || currency)

  return (
    <section className="page" aria-labelledby="employees-heading">
      <div className="directory-heading">
        <div className="page-heading">
          <p className="eyebrow">People</p>
          <h1 id="employees-heading">Employees</h1>
          <p>Search and review employee compensation records.</p>
        </div>
        {pagination && <p className="result-count">{pagination.total.toLocaleString()} employees</p>}
      </div>

      <div className="directory-panel">
        <div className="directory-toolbar">
          <form className="search-form" onSubmit={submitSearch} role="search">
            <label className="sr-only" htmlFor="employee-search">Search employees</label>
            <input
              id="employee-search"
              type="search"
              placeholder="Search by name or employee number"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button className="button button--primary" type="submit">Search</button>
          </form>

          <div className="directory-filters">
            <label>
              <span className="sr-only">Country</span>
              <select
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">All countries</option>
                {countries.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Department</span>
              <select
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">All departments</option>
                {departments.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Currency</span>
              <select
                value={currency}
                onChange={(event) => {
                  setCurrency(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">All currencies</option>
                {currencies.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            {hasFilters && (
              <button className="button button--secondary" type="button" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && <p className="directory-message" role="status">Loading employees…</p>}

        {!loading && error && (
          <div className="directory-message directory-message--error" role="alert">
            <p>{error}</p>
            <button
              className="button button--primary"
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && employees.length === 0 && (
          <p className="directory-message">No employees match your search.</p>
        )}

        {!loading && !error && employees.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Role</th>
                  <th scope="col">Country</th>
                  <th scope="col">Level</th>
                  <th scope="col">Currency</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <Link className="employee-link" to={`/employees/${employee.id}`}>
                        {employee.first_name} {employee.last_name}
                      </Link>
                      <span>{employee.email}</span>
                      <span>{employee.employee_number}</span>
                    </td>
                    <td>
                      <strong>{employee.job_title}</strong>
                      <span>{employee.department}</span>
                    </td>
                    <td>{employee.country}</td>
                    <td className="level-cell">{employee.level}</td>
                    <td>{employee.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && pagination && pagination.total_pages > 1 && (
          <div className="pagination">
            <p>
              Page {pagination.page} of {pagination.total_pages}
            </p>
            <div>
              <button
                className="button button--secondary"
                type="button"
                disabled={pagination.page === 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </button>
              <button
                className="button button--secondary"
                type="button"
                disabled={pagination.page === pagination.total_pages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function employeeErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return 'Unable to connect to the server. Check your connection and try again.'
  }

  if (error instanceof ApiError && error.status >= 500) {
    return 'The employee service is temporarily unavailable. Try again shortly.'
  }

  return 'Unable to load employees.'
}
