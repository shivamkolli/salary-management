export interface AnalyticsSummary {
  active_employee_count: number
  total_departments: number
  employees_by_department: Record<string, number>
}

export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary
}
