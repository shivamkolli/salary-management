import { apiClient } from './client'
import type {
  EmployeeListParams,
  EmployeeResponse,
  EmployeesResponse,
  SalaryRevisionInput,
  SalaryRevisionResponse,
} from '../types/employee'

export function getEmployees(params: EmployeeListParams = {}) {
  const query = new URLSearchParams()

  if (params.search) query.set('search', params.search)
  if (params.country) query.set('country', params.country)
  if (params.department) query.set('department', params.department)
  if (params.page) query.set('page', params.page.toString())
  if (params.perPage) query.set('per_page', params.perPage.toString())

  const queryString = query.toString()
  const path = queryString ? `/api/employees?${queryString}` : '/api/employees'

  return apiClient.get<EmployeesResponse>(path)
}

export function getEmployee(employeeId: number) {
  return apiClient.get<EmployeeResponse>(`/api/employees/${employeeId}`)
}

export function createSalaryRevision(employeeId: number, input: SalaryRevisionInput) {
  return apiClient.post<SalaryRevisionResponse>(
    `/api/employees/${employeeId}/salary_revisions`,
    { salary_revision: input },
  )
}
