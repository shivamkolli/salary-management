module Api
  class AnalyticsController < ApplicationController
    def summary
      employees = Employee.active

      render json: {
        summary: {
          active_employee_count: employees.count,
          total_departments: employees.distinct.count(:department),
          employees_by_department: employees.group(:department).order(:department).count
        }
      }
    end
  end
end
