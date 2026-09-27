require 'rails_helper'

RSpec.describe SalaryRevision, type: :model do
  subject(:salary_revision) { build(:salary_revision) }

  describe 'associations' do
    it { is_expected.to belong_to(:employee) }
  end

  describe 'validations' do
    it { is_expected.to validate_numericality_of(:base_salary).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:effective_from) }
    it { is_expected.to validate_presence_of(:reason) }
  end
end
