class MurmursController < ApplicationController
  before_action :authenticate_user!
  
  def show
    @murmur = Murmur.includes(:user).find_by(id: params[:id])
    
    unless @murmur
      flash[:alert] = "Murmur not found"
      redirect_to root_path
    end
  end
  
  def create
    @murmur = current_user.murmurs.build(murmur_params)
    
    if @murmur.save
      flash[:notice] = "Murmur posted successfully!"
      redirect_to root_path
    else
      @murmurs = current_user.timeline.includes(:user, :likes)
                             .page(params[:page]).per(10)
      flash.now[:alert] = @murmur.errors.full_messages.join(", ")
      render "home/index"
    end
  end
  
  def destroy
    @murmur = current_user.murmurs.find_by(id: params[:id])
    
    if @murmur
      if @murmur.destroy
        flash[:notice] = "Murmur deleted successfully!"
      else
        flash[:alert] = "Failed to delete murmur"
      end
    else
      flash[:alert] = "Murmur not found or you don't have permission to delete it"
    end
    
    redirect_back(fallback_location: root_path)
  end
  
  private
  
  def murmur_params
    params.require(:murmur).permit(:content)
  end
end
