require 'rails_helper'

RSpec.describe Employee, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:salary_revisions) }
  end
end
