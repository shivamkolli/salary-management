# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_27_125357) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "employees", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "country", limit: 2, null: false
    t.datetime "created_at", null: false
    t.string "currency", limit: 3, null: false
    t.string "department", limit: 100, null: false
    t.string "email", limit: 255, null: false
    t.string "employee_number", limit: 20, null: false
    t.string "first_name", limit: 100, null: false
    t.string "job_title", limit: 100, null: false
    t.date "joined_date", null: false
    t.string "last_name", limit: 100, null: false
    t.string "level", limit: 50, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_employees_on_email", unique: true
    t.index ["employee_number"], name: "index_employees_on_employee_number", unique: true
  end

  create_table "salary_revisions", force: :cascade do |t|
    t.decimal "base_salary", precision: 15, scale: 2, null: false
    t.datetime "created_at", null: false
    t.date "effective_from", null: false
    t.bigint "employee_id", null: false
    t.text "reason", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_salary_revisions_on_employee_id"
  end

  add_foreign_key "salary_revisions", "employees"
end
