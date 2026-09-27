module Api
  module Employees
    class SalaryRevisionsController < ApplicationController
      before_action :set_employee

      def create
        salary_revision = @employee.salary_revisions.build(salary_revision_params)

        if salary_revision.save
          render json: { salary_revision: salary_revision_json(salary_revision) }, status: :created
        else
          render json: { errors: salary_revision.errors.messages.transform_values(&:first) },
                 status: :unprocessable_content
        end
      rescue ActionController::ParameterMissing => e
        render json: { error: e.message }, status: :bad_request
      end

      private

      def set_employee
        @employee = Employee.find(params[:employee_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Employee not found" }, status: :not_found
      end

      def salary_revision_params
        params.require(:salary_revision).permit(:base_salary, :effective_from, :reason)
      end

      def salary_revision_json(revision)
        {
          id: revision.id,
          base_salary: revision.base_salary.to_s("F"),
          effective_from: revision.effective_from,
          reason: revision.reason,
          created_at: revision.created_at
        }
      end
    end
  end
end
