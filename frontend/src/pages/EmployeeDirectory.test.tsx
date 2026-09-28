import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { getEmployees } from '../api/employees'
import { EmployeeDirectory } from './EmployeeDirectory'

vi.mock('../api/employees', () => ({
  getEmployees: vi.fn(),
}))

const mockedGetEmployees = vi.mocked(getEmployees)

describe('EmployeeDirectory', () => {
  beforeEach(() => {
    mockedGetEmployees.mockReset()
    mockedGetEmployees.mockResolvedValue({
      employees: [],
      pagination: {
        page: 1,
        per_page: 25,
        total: 0,
        total_pages: 0,
      },
    })
  })

  it('shows full country names in the employee table', async () => {
    mockedGetEmployees.mockResolvedValue({
      employees: [
        {
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
        },
      ],
      pagination: {
        page: 1,
        per_page: 25,
        total: 1,
        total_pages: 1,
      },
    })

    render(
      <MemoryRouter>
        <EmployeeDirectory />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('cell', { name: 'United States' })).toBeInTheDocument()
  })

  it('filters employees by currency', async () => {
    render(
      <MemoryRouter>
        <EmployeeDirectory />
      </MemoryRouter>,
    )

    await waitFor(() => expect(mockedGetEmployees).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByRole('combobox', { name: 'Currency' }), {
      target: { value: 'USD' },
    })

    await waitFor(() => {
      expect(mockedGetEmployees).toHaveBeenLastCalledWith({
        page: 1,
        search: '',
        country: '',
        department: '',
        currency: 'USD',
      })
    })
  })

  it('explains a network failure and retries the request', async () => {
    mockedGetEmployees
      .mockReset()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        employees: [],
        pagination: {
          page: 1,
          per_page: 25,
          total: 0,
          total_pages: 0,
        },
      })

    render(
      <MemoryRouter>
        <EmployeeDirectory />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to connect to the server. Check your connection and try again.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('No employees match your search.')).toBeInTheDocument()
    expect(mockedGetEmployees).toHaveBeenCalledTimes(2)
  })

  it('explains when the employee API is unavailable', async () => {
    mockedGetEmployees.mockRejectedValue(new ApiError(503, undefined))

    render(
      <MemoryRouter>
        <EmployeeDirectory />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The employee service is temporarily unavailable. Try again shortly.',
    )
  })
})
