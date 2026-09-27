require 'rails_helper'

RSpec.describe SalaryRevision, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:employee) }
  end
end
