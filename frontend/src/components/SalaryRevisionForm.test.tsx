import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { createSalaryRevision } from '../api/employees'
import { SalaryRevisionForm } from './SalaryRevisionForm'

vi.mock('../api/employees', () => ({
  createSalaryRevision: vi.fn(),
}))

const mockedCreateSalaryRevision = vi.mocked(createSalaryRevision)

describe('SalaryRevisionForm', () => {
  beforeEach(() => {
    mockedCreateSalaryRevision.mockReset()
  })

  it('creates a salary revision and reports the new record', async () => {
    const salaryRevision = {
      id: 12,
      base_salary: '120000.0',
      effective_from: '2026-09-28',
      reason: 'Annual review',
      created_at: '2026-09-28T10:00:00Z',
    }
    const onCreated = vi.fn()
    mockedCreateSalaryRevision.mockResolvedValue({ salary_revision: salaryRevision })

    render(
      <SalaryRevisionForm
        employeeId={7}
        currency="USD"
        onCreated={onCreated}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Annual salary (USD)'), {
      target: { value: '120000' },
    })
    fireEvent.change(screen.getByLabelText('Effective date'), {
      target: { value: '2026-09-28' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Annual review' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Revise salary' }))

    await waitFor(() => {
      expect(mockedCreateSalaryRevision).toHaveBeenCalledWith(7, {
        base_salary: 120000,
        effective_from: '2026-09-28',
        reason: 'Annual review',
      })
    })
    expect(onCreated).toHaveBeenCalledWith(salaryRevision)
    expect(screen.getByRole('status')).toHaveTextContent('Salary revision added.')
  })

  it('shows validation errors returned by the API', async () => {
    mockedCreateSalaryRevision.mockRejectedValue(
      new ApiError(422, { errors: { base_salary: 'must be greater than 0' } }),
    )

    render(
      <SalaryRevisionForm
        employeeId={7}
        currency="USD"
        onCreated={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('Annual salary (USD)'), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByLabelText('Effective date'), {
      target: { value: '2026-09-28' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Correction' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Revise salary' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('must be greater than 0')
  })

  it('clears the form without creating a revision when cancelled', () => {
    const onCancel = vi.fn()
    render(
      <SalaryRevisionForm
        employeeId={7}
        currency="USD"
        onCreated={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.change(screen.getByLabelText('Annual salary (USD)'), {
      target: { value: '120000' },
    })
    fireEvent.change(screen.getByLabelText('Effective date'), {
      target: { value: '2026-09-28' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Annual review' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByLabelText('Annual salary (USD)')).toHaveValue(null)
    expect(screen.getByLabelText('Effective date')).toHaveValue('')
    expect(screen.getByLabelText('Reason')).toHaveValue('')
    expect(mockedCreateSalaryRevision).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
