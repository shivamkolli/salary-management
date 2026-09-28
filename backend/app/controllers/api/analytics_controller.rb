module Api
  class AnalyticsController < ApplicationController
    def summary
      employees = Employee.active

      render json: {
        summary: {
          active_employee_count: employees.count,
          total_departments: employees.distinct.count(:department),
          employees_by_department: employees.group(:department).order(:department).count,
          monthly_salary_by_currency: monthly_salary_by_currency(employees)
        }
      }
    end

    private

    def monthly_salary_by_currency(employees)
      current_salaries = current_salaries_query.to_sql

      annual_totals = employees
        .joins("INNER JOIN (#{current_salaries}) current_salaries ON current_salaries.employee_id = employees.id")
        .group(:currency)
        .order(:currency)
        .sum("current_salaries.base_salary")

      annual_totals.transform_values do |annual_total|
        format("%.2f", annual_total / 12)
      end
    end

    def current_salaries_query
      SalaryRevision
        .where(effective_from: ..Date.current)
        .select("DISTINCT ON (employee_id) employee_id, base_salary")
        .order(:employee_id, effective_from: :desc, id: :desc)
    end
  end
end
