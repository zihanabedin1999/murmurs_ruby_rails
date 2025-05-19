class Api::FollowsController < Api::BaseController
  before_action :set_user
  
  def create
    return render_error "User not found", :not_found unless @user
    return render_error "Cannot follow yourself" if @user.id == current_user.id
    
    if current_user.following?(@user)
      render_error "You are already following this user"
      return
    end
    
    if current_user.follow(@user)
      render json: { 
        success: true, 
        followers_count: @user.followers.count,
        following_count: @user.following.count
      }
    else
      render_error "Failed to follow user"
    end
  end
  
  def destroy
    return render_error "User not found", :not_found unless @user
    
    if !current_user.following?(@user)
      render_error "You are not following this user"
      return
    end
    
    if current_user.unfollow(@user)
      render json: { 
        success: true, 
        followers_count: @user.followers.count,
        following_count: @user.following.count
      }
    else
      render_error "Failed to unfollow user"
    end
  end
  
  private
  
  def set_user
    @user = User.find_by(id: params[:user_id])
  end
end
