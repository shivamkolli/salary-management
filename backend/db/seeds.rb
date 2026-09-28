employee_count = 10_000
batch_size = 1_000
seeded_at = Time.zone.local(2026, 1, 1)
joined_dates = (Date.new(2015, 1, 1)..Date.new(2024, 12, 31)).to_a

Faker::Config.random = Random.new(seeded_at.year)

locations = [
  [ "IN", "INR" ],
  [ "US", "USD" ],
  [ "GB", "GBP" ],
  [ "DE", "EUR" ]
].freeze

roles = [
  [ "Engineering", "Software Engineer" ],
  [ "Engineering", "QA Engineer" ],
  [ "Finance", "Financial Analyst" ],
  [ "Finance", "Accountant" ],
  [ "Human Resources", "HR Generalist" ],
  [ "Human Resources", "Recruiter" ],
  [ "Marketing", "Marketing Specialist" ],
  [ "Operations", "Operations Analyst" ],
  [ "Sales", "Account Executive" ],
  [ "Sales", "Sales Representative" ]
].freeze

levels = %w[junior junior junior mid mid mid senior senior lead staff principal].freeze

base_salaries = {
  "INR" => { "junior" => 500_000, "mid" => 900_000, "senior" => 1_400_000, "lead" => 1_900_000, "staff" => 2_400_000, "principal" => 3_000_000 },
  "USD" => { "junior" => 55_000, "mid" => 80_000, "senior" => 110_000, "lead" => 135_000, "staff" => 155_000, "principal" => 180_000 },
  "EUR" => { "junior" => 45_000, "mid" => 65_000, "senior" => 85_000, "lead" => 105_000, "staff" => 125_000, "principal" => 145_000 },
  "GBP" => { "junior" => 40_000, "mid" => 58_000, "senior" => 78_000, "lead" => 95_000, "staff" => 112_000, "principal" => 130_000 }
}.freeze

location_cycle = locations.cycle
role_cycle = roles.cycle
level_cycle = levels.cycle
joined_date_cycle = joined_dates.cycle

employees = []
salaries = {}

employee_count.times do |index|
  sequence = index + 1
  employee_number = format("EMP-%05d", sequence)
  first_name = Faker::Name.first_name
  last_name = Faker::Name.last_name
  country, currency = location_cycle.next
  department, job_title = role_cycle.next
  level = level_cycle.next
  joined_date = joined_date_cycle.next

  employees << {
    employee_number: employee_number,
    first_name: first_name,
    last_name: last_name,
    email: "#{first_name}.#{last_name}.#{sequence}@acme.com".downcase,
    country: country,
    department: department,
    job_title: job_title,
    level: level,
    currency: currency,
    joined_date: joined_date,
    active: true,
    created_at: seeded_at,
    updated_at: seeded_at
  }

  salaries[employee_number] = {
    base_salary: base_salaries[currency][level],
    effective_from: joined_date
  }
end

employees.each_slice(batch_size) do |batch|
  Employee.upsert_all(batch, unique_by: :index_employees_on_employee_number)
end

employees_without_salary = Employee
  .where(employee_number: salaries.keys)
  .where.missing(:salary_revisions)
  .pluck(:employee_number, :id)

salary_revisions = employees_without_salary.map do |employee_number, employee_id|
  salary = salaries[employee_number]

  {
    employee_id: employee_id,
    base_salary: salary[:base_salary],
    effective_from: salary[:effective_from],
    reason: "Initial salary",
    created_at: seeded_at,
    updated_at: seeded_at
  }
end

salary_revisions.each_slice(batch_size) do |batch|
  SalaryRevision.insert_all!(batch)
end

puts "Seeded #{employees.size} employees."
puts "Added #{salary_revisions.size} initial salary revisions."
