class Api::UsersController < Api::BaseController
  def show
    @user = User.find_by(id: params[:id])
    
    if @user
      render json: {
        id: @user.id,
        name: @user.name,
        username: @user.username,
        bio: @user.bio,
        avatar_url: @user.avatar_url,
        following_count: @user.following.count,
        followers_count: @user.followers.count,
        is_following: current_user&.following?(@user),
        is_current_user: @user.id == current_user&.id
      }
    else
      render_error "User not found", :not_found
    end
  end
  
  def murmurs
    @user = User.find_by(id: params[:id])
    
    if @user
      @murmurs = @user.murmurs.recent.includes(:likes)
                      .page(params[:page]).per(10)
      
      render json: {
        murmurs: @murmurs.map { |murmur| murmur_json(murmur) },
        pagination: {
          current_page: @murmurs.current_page,
          total_pages: @murmurs.total_pages,
          total_count: @murmurs.total_count
        }
      }
    else
      render_error "User not found", :not_found
    end
  end
  
  private
  
  def murmur_json(murmur)
    {
      id: murmur.id,
      content: murmur.content,
      created_at: murmur.created_at,
      formatted_date: murmur.formatted_date,
      like_count: murmur.like_count,
      liked_by_current_user: murmur.liked_by?(current_user),
      user: {
        id: murmur.user.id,
        name: murmur.user.name,
        username: murmur.user.username,
        avatar_url: murmur.user.avatar_url
      }
    }
  end
end
