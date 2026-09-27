require 'rails_helper'

RSpec.describe Employee, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:salary_revisions) }
  end

  describe 'validations' do
    it { is_expected.to validate_inclusion_of(:level).in_array(described_class::LEVELS) }
    it { is_expected.to validate_inclusion_of(:currency).in_array(described_class::CURRENCIES) }
  end

  describe '.active' do
    subject(:active_employees) { described_class.active }

    let!(:active_employee) { create(:employee) }

    before do
      create(:employee, :inactive)
    end

    it 'returns only active employees' do
      expect(active_employees).to contain_exactly(active_employee)
    end
  end
end
