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

  def employee_ids
    response.parsed_body['employees'].pluck('id')
  end
end
