import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSalaryRevision, getEmployee } from '../api/employees'
import { EmployeeDetails } from './EmployeeDetails'

vi.mock('../api/employees', () => ({
  getEmployee: vi.fn(),
  createSalaryRevision: vi.fn(),
}))

const mockedGetEmployee = vi.mocked(getEmployee)
const mockedCreateSalaryRevision = vi.mocked(createSalaryRevision)

describe('EmployeeDetails', () => {
  beforeEach(() => {
    mockedGetEmployee.mockReset()
    mockedCreateSalaryRevision.mockReset()
    mockedGetEmployee.mockResolvedValue({
      employee: {
        id: 7,
        employee_number: 'EMP-00007',
        first_name: 'Ava',
        last_name: 'Shah',
        email: 'ava.shah@acme.test',
        country: 'US',
        department: 'Engineering',
        job_title: 'Staff Engineer',
        level: 'staff',
        currency: 'USD',
        joined_date: '2022-01-10',
        active: true,
        current_salary: '120000.0',
        salary_revisions: [],
      },
    })
  })

  it('opens the salary revision form on demand and closes it on cancel', async () => {
    render(
      <MemoryRouter initialEntries={['/employees/7']}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Ava Shah' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Add salary revision' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Revise salary' }))

    expect(screen.getByRole('heading', { name: 'Add salary revision' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('heading', { name: 'Add salary revision' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revise salary' })).toBeInTheDocument()
  })

  it('closes the form and restores the revise action after a successful submission', async () => {
    mockedCreateSalaryRevision.mockResolvedValue({
      salary_revision: {
        id: 12,
        base_salary: '130000.0',
        effective_from: '2026-09-28',
        reason: 'Annual review',
        created_at: '2026-09-28T10:00:00Z',
      },
    })

    render(
      <MemoryRouter initialEntries={['/employees/7']}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetails />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Ava Shah' })
    fireEvent.click(screen.getByRole('button', { name: 'Revise salary' }))
    fireEvent.change(screen.getByLabelText('Annual salary (USD)'), {
      target: { value: '130000' },
    })
    fireEvent.change(screen.getByLabelText('Effective date'), {
      target: { value: '2026-09-28' },
    })
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Annual review' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Revise salary' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add salary revision' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Revise salary' })).toBeInTheDocument()
    expect(screen.getByText('Annual review')).toBeInTheDocument()
  })
})
