require "rails_helper"

RSpec.describe "Api::Health", type: :request do
  describe "GET /api/health" do
    it "returns the service status" do
      get "/api/health"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq("status" => "ok")
    end

    it "allows requests from the configured frontend origin" do
      get "/api/health", headers: { "Origin" => "http://localhost:5173" }

      expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:5173")
    end

    it "does not allow requests from another origin" do
      get "/api/health", headers: { "Origin" => "https://example.com" }

      expect(response.headers["Access-Control-Allow-Origin"]).to be_nil
    end
  end
end
