FactoryBot.define do
  factory :employee do
    sequence(:employee_number) { |number| format('EMP-%05d', number) }
    sequence(:email) { |number| "employee#{number}@acme.test" }
    first_name { 'Jane' }
    last_name { 'Doe' }
    country { 'IN' }
    department { 'Engineering' }
    job_title { 'Software Engineer' }
    level { 'staff' }
    currency { 'INR' }
    joined_date { Date.new(2020, 1, 1) }
    active { true }

    trait :inactive do
      active { false }
    end

    trait :with_salary_revision do
      after(:create) do |employee|
        create(:salary_revision, employee: employee)
      end
    end
  end
end
