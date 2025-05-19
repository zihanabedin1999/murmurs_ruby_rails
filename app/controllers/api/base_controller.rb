class Api::BaseController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!
  
  private
  
  def render_error(message, status = :unprocessable_entity)
    render json: { error: message }, status: status
  end
end
