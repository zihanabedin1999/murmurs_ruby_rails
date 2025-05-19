class RegistrationsController < ApplicationController
  def new
    redirect_to root_path if logged_in?
    @user = User.new
  end
  
  def create
    @user = User.new(user_params)
    
    if @user.save
      session[:user_id] = @user.id
      flash[:notice] = "Account created successfully!"
      redirect_to root_path
    else
      flash.now[:alert] = @user.errors.full_messages.join(", ")
      render :new
    end
  end
  
  private
  
  def user_params
    params.require(:user).permit(:name, :username, :email, :password, :password_confirmation, :bio)
  end
end
