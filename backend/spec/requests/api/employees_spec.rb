require 'rails_helper'

RSpec.describe 'Api::Employees', type: :request do
  describe 'GET /api/employees' do
    it 'returns active employees in name order with pagination details' do
      second_employee = create(:employee, first_name: 'Robb', last_name: 'Stark')
      first_employee = create(:employee, first_name: 'Tony', last_name: 'Mark')
      create(:employee, :inactive)

      get '/api/employees'

      expect(response).to have_http_status(:ok)
      expect(employee_ids).to eq([ first_employee.id, second_employee.id ])
      expect(response.parsed_body['pagination']).to eq(
        'page' => 1,
        'per_page' => 25,
        'total' => 2,
        'total_pages' => 1
      )
    end

    it 'paginates employees and caps the page size at 100' do
      employees = create_list(:employee, 3, last_name: 'Employee')

      get '/api/employees', params: { page: 2, per_page: 2 }

      expect(response).to have_http_status(:ok)
      expect(employee_ids).to eq([ employees.third.id ])
      expect(response.parsed_body['pagination']).to include(
        'page' => 2,
        'per_page' => 2,
        'total' => 3,
        'total_pages' => 2
      )

      get '/api/employees', params: { per_page: 101 }
      expect(response.parsed_body.dig('pagination', 'per_page')).to eq(100)
    end

    it 'uses the minimum value for invalid pagination values' do
      create(:employee)

      get '/api/employees', params: { page: 'invalid', per_page: 0 }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['pagination']).to include(
        'page' => 1,
        'per_page' => 1
      )
    end
  end

  describe 'GET /api/employees/:id' do
    it 'returns the employee, current salary, and salary history' do
      employee = create(:employee, first_name: 'Tony', last_name: 'Stark')
      older_revision = create(:salary_revision, employee: employee, base_salary: 1_100_000,
                                                 effective_from: Date.new(2025, 4, 1))
      current_salary = create(:salary_revision, employee: employee, base_salary: 1_200_000,
                                                 effective_from: Date.new(2025, 7, 1))

      get "/api/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['employee']).to include(
        'id' => employee.id,
        'employee_number' => employee.employee_number,
        'first_name' => 'Tony',
        'last_name' => 'Stark',
        'email' => employee.email,
        'currency' => employee.currency,
        'current_salary' => '1200000.0'
      )
      expect(response.parsed_body.dig('employee', 'salary_revisions')).to match(
        [
          a_hash_including(
            'id' => current_salary.id,
            'base_salary' => '1200000.0',
            'effective_from' => current_salary.effective_from.to_s,
            'reason' => current_salary.reason
          ),
          a_hash_including(
            'id' => older_revision.id,
            'base_salary' => '1100000.0',
            'effective_from' => older_revision.effective_from.to_s,
            'reason' => older_revision.reason
          )
        ]
      )
    end

    it 'returns nil salary details when the employee has no salary revisions' do
      employee = create(:employee)

      get "/api/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['employee']).to include(
        'current_salary' => nil,
        'salary_revisions' => []
      )
    end

    it 'returns not found for an unknown employee' do
      get '/api/employees/0'

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq('error' => 'Employee not found')
    end
  end

  def employee_ids
    response.parsed_body['employees'].pluck('id')
  end
end
