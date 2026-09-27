FactoryBot.define do
  factory :salary_revision do
    association :employee
    base_salary { 1_000_000.00 }
    effective_from { Date.current }
    reason { 'Initial salary' }
  end
end
