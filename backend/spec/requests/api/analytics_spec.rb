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
        },
        'monthly_salary_by_currency' => {}
      )
    end

    it 'returns monthly salary totals by currency using each active employee current salary' do
      us_employee = create(:employee, currency: 'USD')
      indian_employee = create(:employee, currency: 'INR')
      inactive_employee = create(:employee, :inactive, currency: 'USD')

      create(:salary_revision, employee: us_employee, base_salary: 120_000,
                               effective_from: 1.month.ago.to_date)
      create(:salary_revision, employee: us_employee, base_salary: 96_000,
                               effective_from: 1.year.ago.to_date)
      create(:salary_revision, employee: us_employee, base_salary: 240_000,
                               effective_from: 1.month.from_now.to_date)
      create(:salary_revision, employee: indian_employee, base_salary: 1_200_000)
      create(:salary_revision, employee: inactive_employee, base_salary: 60_000)

      get '/api/analytics/summary'

      expect(response).to have_http_status(:ok)
      expect(summary['monthly_salary_by_currency']).to eq(
        'INR' => '100000.00',
        'USD' => '10000.00'
      )
    end

    def summary
      response.parsed_body.fetch('summary')
    end
  end
end
