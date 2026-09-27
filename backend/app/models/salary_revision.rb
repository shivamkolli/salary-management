class SalaryRevision < ApplicationRecord
  belongs_to :employee

  validates :base_salary,
            numericality: { greater_than: 0 }
  validates :effective_from, presence: true
  validates :reason, presence: true
end
