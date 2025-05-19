class UsersController < ApplicationController
  before_action :authenticate_user!
  
  def show
    @user = User.find_by(id: params[:id])
    
    if @user
      @murmurs = @user.murmurs.recent.includes(:likes)
                      .page(params[:page]).per(10)
    else
      flash[:alert] = "User not found"
      redirect_to root_path
    end
  end
end
