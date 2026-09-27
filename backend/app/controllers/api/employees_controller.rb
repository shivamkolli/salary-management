module Api
  class EmployeesController < ApplicationController
    DEFAULT_PER_PAGE = 25
    MAX_PER_PAGE = 100

    def index
      page = [ params.fetch(:page, 1).to_i, 1 ].max
      per_page = params.fetch(:per_page, DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)
      employees = Employee.active.order(:last_name, :first_name, :id)
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
  end
end
