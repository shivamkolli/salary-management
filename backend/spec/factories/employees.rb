FactoryBot.define do
  factory :employee do
    sequence(:employee_number) { |number| format('EMP-%05d', number) }
    sequence(:email) { |number| "employee#{number}.#{Faker::Internet.username}@acme.test" }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    country { 'IN' }
    department { Faker::Company.industry }
    job_title { Faker::Job.title }
    level { 'staff' }
    currency { 'INR' }
    joined_date { Faker::Date.between(from: 10.years.ago, to: Date.current) }
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
