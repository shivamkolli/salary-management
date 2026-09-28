import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAnalyticsSummary } from '../api/analytics'
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

  it('shows an error when the summary cannot be loaded', async () => {
    mockedGetAnalyticsSummary.mockRejectedValue(new Error('Request failed'))

    render(<SummaryPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load organization summary.',
    )
  })
})
