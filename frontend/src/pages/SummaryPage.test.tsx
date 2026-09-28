import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAnalyticsSummary } from '../api/analytics'
import { ApiError } from '../api/client'
import { SummaryPage } from './SummaryPage'

vi.mock('../api/analytics', () => ({
  getAnalyticsSummary: vi.fn(),
}))

const mockedGetAnalyticsSummary = vi.mocked(getAnalyticsSummary)

describe('SummaryPage', () => {
  beforeEach(() => {
    mockedGetAnalyticsSummary.mockReset()
  })

  it('shows organization and department headcounts', async () => {
    mockedGetAnalyticsSummary.mockResolvedValue({
      summary: {
        active_employee_count: 10_000,
        total_departments: 2,
        employees_by_department: {
          Engineering: 6_000,
          Finance: 4_000,
        },
      },
    })

    render(<SummaryPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading summary…')
    expect(await screen.findByRole('heading', { name: 'Organization summary' })).toBeInTheDocument()
    expect(screen.getByText('10,000')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: 'Engineering 6,000' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: 'Finance 4,000' })).toBeInTheDocument()
  })

  it('explains a network failure and retries the request', async () => {
    mockedGetAnalyticsSummary
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        summary: {
          active_employee_count: 10_000,
          total_departments: 0,
          employees_by_department: {},
        },
      })

    render(<SummaryPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to connect to the server. Check your connection and try again.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('heading', { name: 'Organization summary' })).toBeInTheDocument()
    expect(mockedGetAnalyticsSummary).toHaveBeenCalledTimes(2)
  })

  it('explains when the summary API is unavailable', async () => {
    mockedGetAnalyticsSummary.mockRejectedValue(new ApiError(503, undefined))

    render(<SummaryPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The summary service is temporarily unavailable. Try again shortly.',
    )
  })
})
