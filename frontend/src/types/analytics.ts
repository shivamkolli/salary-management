export interface AnalyticsSummary {
  active_employee_count: number
  total_departments: number
  employees_by_department: Record<string, number>
  monthly_salary_by_currency: Record<string, string>
}

export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary
}
