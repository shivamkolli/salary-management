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

  describe '#recent_revisions' do
    subject(:recent_revisions) { employee.recent_revisions }

    let(:employee) { create(:employee) }

    it 'orders revisions by effective date and ID, newest first' do
      older_revision = create(:salary_revision, employee: employee, effective_from: Date.new(2022, 1, 1))
      first_same_day_revision = create(:salary_revision, employee: employee, effective_from: Date.new(2023, 1, 1))
      latest_same_day_revision = create(:salary_revision, employee: employee, effective_from: Date.new(2023, 1, 1))

      expect(recent_revisions).to eq(
        [ latest_same_day_revision, first_same_day_revision, older_revision ]
      )
    end
  end

  describe '#current_revision' do
    subject(:current_revision) { employee.current_revision }

    let(:employee) { create(:employee) }

    it 'returns nil when the employee has no salary revisions' do
      expect(current_revision).to be_nil
    end

    it 'returns the revision with the latest effective date' do
      create(:salary_revision, employee: employee, effective_from: Date.new(2021, 1, 1))
      expected_revision = create(:salary_revision, employee: employee, effective_from: Date.new(2023, 1, 1))
      create(:salary_revision, employee: employee, effective_from: Date.new(2022, 1, 1))

      expect(current_revision).to eq(expected_revision)
    end

    it 'uses the latest recorded revision when effective dates match' do
      create(:salary_revision, employee: employee, effective_from: Date.new(2023, 1, 1))
      expected_revision = create(:salary_revision, employee: employee, effective_from: Date.new(2023, 1, 1))

      expect(current_revision).to eq(expected_revision)
    end
  end
end
