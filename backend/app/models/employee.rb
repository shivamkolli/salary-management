class Employee < ApplicationRecord
  LEVELS = %w[junior mid senior lead staff principal].freeze
  CURRENCIES = %w[INR USD EUR GBP].freeze

  has_many :salary_revisions

  validates :level, inclusion: { in: LEVELS }
  validates :currency, inclusion: { in: CURRENCIES }

  scope :active, -> { where(active: true) }
end
