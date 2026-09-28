Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    get "analytics/summary", to: "analytics#summary"

    resources :employees, only: %i[index show] do
      resources :salary_revisions, only: :create, module: :employees
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.

  # Defines the root path route ("/")
  # root "posts#index"
end
