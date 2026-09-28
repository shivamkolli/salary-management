import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAnalyticsSummary } from './analytics'
import { apiClient } from './client'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const mockedGet = vi.mocked(apiClient.get)

describe('getAnalyticsSummary', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('requests the analytics summary endpoint', async () => {
    const response = {
      summary: {
        active_employee_count: 10_000,
        total_departments: 2,
        employees_by_department: {
          Engineering: 6_000,
          Finance: 4_000,
        },
      },
    }

    mockedGet.mockResolvedValue(response)

    await expect(getAnalyticsSummary()).resolves.toEqual(response)
    expect(mockedGet).toHaveBeenCalledWith('/api/analytics/summary')
  })
})
