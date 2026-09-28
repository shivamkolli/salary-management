import type { AnalyticsSummaryResponse } from '../types/analytics'
import { apiClient } from './client'

export function getAnalyticsSummary() {
  return apiClient.get<AnalyticsSummaryResponse>('/api/analytics/summary')
}
