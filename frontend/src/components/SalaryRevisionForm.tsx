import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '../api/client'
import { createSalaryRevision } from '../api/employees'
import type { SalaryRevision, SalaryRevisionInput } from '../types/employee'
import './SalaryRevisionForm.css'

interface SalaryRevisionFormProps {
  employeeId: number
  currency: string
  onCreated: (salaryRevision: SalaryRevision) => void
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof SalaryRevisionInput, string>>

export function SalaryRevisionForm({
  employeeId,
  currency,
  onCreated,
  onCancel,
}: SalaryRevisionFormProps) {
  const [baseSalary, setBaseSalary] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [reason, setReason] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function clearForm() {
    setBaseSalary('')
    setEffectiveFrom('')
    setReason('')
    setFieldErrors({})
    setFormError('')
    setSuccessMessage('')
  }

  function cancelRevision() {
    clearForm()
    onCancel()
  }

  async function submitSalaryRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setFormError('')
    setSuccessMessage('')

    try {
      const response = await createSalaryRevision(employeeId, {
        base_salary: Number(baseSalary),
        effective_from: effectiveFrom,
        reason: reason.trim(),
      })

      onCreated(response.salary_revision)
      clearForm()
      setSuccessMessage('Salary revision added.')
    } catch (requestError) {
      const errors = requestError instanceof ApiError
        ? extractFieldErrors(requestError.body)
        : {}

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      } else {
        setFormError('Unable to add salary revision.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="salary-form-card" aria-labelledby="salary-form-heading">
      <div>
        <p className="eyebrow">Update</p>
        <h2 id="salary-form-heading">Add salary revision</h2>
        <p className="salary-form-description">
          Record a new annual salary in {currency}.
        </p>
      </div>

      <form className="salary-form" onSubmit={submitSalaryRevision}>
        <label>
          <span>Annual salary ({currency})</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={baseSalary}
            onChange={(event) => setBaseSalary(event.target.value)}
          />
          {fieldErrors.base_salary && <small role="alert">{fieldErrors.base_salary}</small>}
        </label>

        <label>
          <span>Effective date</span>
          <input
            type="date"
            required
            value={effectiveFrom}
            onChange={(event) => setEffectiveFrom(event.target.value)}
          />
          {fieldErrors.effective_from && <small role="alert">{fieldErrors.effective_from}</small>}
        </label>

        <label className="salary-form__reason">
          <span>Reason</span>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {fieldErrors.reason && <small role="alert">{fieldErrors.reason}</small>}
        </label>

        <div className="salary-form__actions">
          <button
            className="salary-cancel"
            type="button"
            disabled={submitting}
            onClick={cancelRevision}
          >
            Cancel
          </button>
          <button className="salary-submit" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Revise salary'}
          </button>
          {formError && <p className="salary-form__error" role="alert">{formError}</p>}
          {successMessage && <p className="salary-form__success" role="status">{successMessage}</p>}
        </div>
      </form>
    </section>
  )
}

function extractFieldErrors(body: unknown): FieldErrors {
  if (typeof body !== 'object' || body === null || !('errors' in body)) return {}

  const errors = body.errors
  if (typeof errors !== 'object' || errors === null) return {}

  return errors as FieldErrors
}
