class Employee < ApplicationRecord
  LEVELS = %w[junior mid senior lead staff principal].freeze
  CURRENCIES = %w[INR USD EUR GBP].freeze

  has_many :salary_revisions

  validates :level, inclusion: { in: LEVELS }
  validates :currency, inclusion: { in: CURRENCIES }

  scope :active, -> { where(active: true) }

  def recent_revisions
    salary_revisions
      .select { |revision| revision.effective_from <= Date.current }
      .sort_by { |revision| [ revision.effective_from, revision.id ] }
      .reverse
  end

  def current_revision
    recent_revisions.first
  end
end
