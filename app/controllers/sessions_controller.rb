class SessionsController < ApplicationController
  def new
    redirect_to root_path if logged_in?
  end
  
  def create
    user = User.find_by(username: params[:username]) || User.find_by(email: params[:username])
    
    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      flash[:notice] = "Successfully logged in!"
      redirect_to root_path
    else
      flash.now[:alert] = "Invalid username/email or password"
      render :new
    end
  end
  
  def destroy
    session.delete(:user_id)
    flash[:notice] = "Successfully logged out!"
    redirect_to login_path
  end
end
