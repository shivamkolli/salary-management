import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
})
