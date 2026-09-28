FactoryBot.define do
  factory :salary_revision do
    association :employee
    base_salary { Faker::Number.between(from: 500_000, to: 3_000_000) }
    effective_from { Faker::Date.backward(days: 365) }
    reason { Faker::Lorem.sentence(word_count: 3) }
  end
end
