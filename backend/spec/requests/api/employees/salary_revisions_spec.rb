require 'rails_helper'

RSpec.describe 'Api::Employees::SalaryRevisions', type: :request do
  describe 'POST /api/employees/:employee_id/salary_revisions' do
    let(:employee) { create(:employee) }
    let!(:existing_revision) { create(:salary_revision, employee: employee) }
    let(:valid_attributes) do
      {
        base_salary: 1_200_000,
        effective_from: Date.current,
        reason: 'Annual review'
      }
    end

    it 'appends a salary revision and preserves the existing history' do
      expect do
        post salary_revisions_path, params: { salary_revision: valid_attributes }, as: :json
      end.to change(employee.salary_revisions, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['salary_revision']).to include(
        'base_salary' => '1200000.0',
        'effective_from' => Date.current.to_s,
        'reason' => 'Annual review'
      )
      expect(SalaryRevision.exists?(existing_revision.id)).to be(true)
    end

    it 'returns validation errors without creating a revision' do
      attributes = valid_attributes.merge(base_salary: 0, effective_from: nil, reason: '')

      expect do
        post salary_revisions_path, params: { salary_revision: attributes }, as: :json
      end.not_to change(employee.salary_revisions, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['errors']).to include(
        'base_salary' => 'must be greater than 0',
        'effective_from' => "can't be blank",
        'reason' => "can't be blank"
      )
    end

    it 'returns not found for an unknown employee' do
      post '/api/employees/0/salary_revisions',
           params: { salary_revision: valid_attributes },
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq('error' => 'Employee not found')
    end

    it 'returns bad request when the salary revision payload is missing' do
      post salary_revisions_path, params: {}, as: :json

      expect(response).to have_http_status(:bad_request)
    end
  end

  def salary_revisions_path
    "/api/employees/#{employee.id}/salary_revisions"
  end
end
