class CreateSalaryRevisions < ActiveRecord::Migration[8.1]
  def change
    create_table :salary_revisions do |t|
      t.references :employee, null: false, foreign_key: true
      t.decimal :base_salary, precision: 15, scale: 2, null: false
      t.date :effective_from, null: false
      t.text :reason, null: false
      t.timestamps
    end
  end
end
