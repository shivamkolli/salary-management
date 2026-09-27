class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_number, limit: 20, null: false
      t.string :first_name, limit: 100, null: false
      t.string :last_name, limit: 100, null: false
      t.string :email, limit: 255, null: false
      t.string :country, limit: 2, null: false
      t.string :department, limit: 100, null: false
      t.string :job_title, limit: 100, null: false
      t.string :level, limit: 50, null: false
      t.string :currency, limit: 3, null: false
      t.date :joined_date, null: false
      t.boolean :active, default: true, null: false

      t.timestamps null: false
    end

    add_index :employees, :employee_number, unique: true
    add_index :employees, :email, unique: true
  end
end
