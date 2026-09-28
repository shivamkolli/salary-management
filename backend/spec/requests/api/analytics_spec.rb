require 'rails_helper'

RSpec.describe 'Api::Analytics', type: :request do
  describe 'GET /api/analytics/summary' do
    it 'returns active employee and department counts' do
      create_list(:employee, 2, department: 'Engineering')
      create(:employee, department: 'Finance')
      create(:employee, :inactive, department: 'Sales')

      get '/api/analytics/summary'

      expect(response).to have_http_status(:ok)
      expect(summary).to eq(
        'active_employee_count' => 3,
        'total_departments' => 2,
        'employees_by_department' => {
          'Engineering' => 2,
          'Finance' => 1
        }
      )
    end

    def summary
      response.parsed_body.fetch('summary')
    end
  end
end
