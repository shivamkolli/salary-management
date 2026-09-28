module Api
  class EmployeesController < ApplicationController
    DEFAULT_PER_PAGE = 25
    MAX_PER_PAGE = 100

    def index
      page = [ params.fetch(:page, 1).to_i, 1 ].max
      per_page = params.fetch(:per_page, DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)
      employees = search_employees(Employee.active)
      employees = filter_employees(employees)
      employees = employees.order(:last_name, :first_name, :id)
      total_count = employees.count

      render json: {
        employees: employees.limit(per_page).offset((page - 1) * per_page),
        pagination: {
          page: page,
          per_page: per_page,
          total: total_count,
          total_pages: (total_count.to_f / per_page).ceil
        }
      }
    end

    def show
      employee = Employee.includes(:salary_revisions).find(params[:id])
      render json: { employee: employee_detail(employee) }
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Employee not found" }, status: :not_found
    end

    private

    def search_employees(employees)
      return employees if params[:search].blank?

      search = "%#{Employee.sanitize_sql_like(params[:search].strip)}%"
      employees.where(
        "CONCAT(first_name, ' ', last_name) ILIKE :search OR employee_number ILIKE :search",
        search: search
      )
    end

    def filter_employees(employees)
      employees = employees.where(country: params[:country]) if params[:country].present?
      employees = employees.where(department: params[:department]) if params[:department].present?
      employees
    end

    def employee_detail(employee)
      salary_revisions = employee.recent_revisions
      current_revision = employee.current_revision

      {
        id: employee.id,
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        country: employee.country,
        department: employee.department,
        job_title: employee.job_title,
        level: employee.level,
        currency: employee.currency,
        joined_date: employee.joined_date,
        active: employee.active,
        current_salary: current_revision&.base_salary,
        salary_revisions: salary_revisions.map { |revision| salary_revision_json(revision) }
      }
    end

    def salary_revision_json(salary_revision)
      {
        id: salary_revision.id,
        base_salary: salary_revision.base_salary,
        effective_from: salary_revision.effective_from,
        reason: salary_revision.reason,
        created_at: salary_revision.created_at
      }
    end
  end
end
