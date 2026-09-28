export interface Employee {
  id: number
  employee_number: string
  first_name: string
  last_name: string
  email: string
  country: string
  department: string
  job_title: string
  level: string
  currency: string
  joined_date: string
  active: boolean
}

export interface SalaryRevision {
  id: number
  base_salary: string
  effective_from: string
  reason: string
  created_at: string
}

export interface EmployeeDetails extends Employee {
  current_salary: string | null
  salary_revisions: SalaryRevision[]
}

export interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface EmployeesResponse {
  employees: Employee[]
  pagination: Pagination
}

export interface EmployeeResponse {
  employee: EmployeeDetails
}

export interface SalaryRevisionResponse {
  salary_revision: SalaryRevision
}

export interface EmployeeListParams {
  search?: string
  country?: string
  department?: string
  currency?: string
  page?: number
  perPage?: number
}

export interface SalaryRevisionInput {
  base_salary: number
  effective_from: string
  reason: string
}
