class Api::MurmursController < Api::BaseController
  def index
    @murmurs = current_user.timeline.includes(:user, :likes)
                           .page(params[:page]).per(10)
    
    render json: {
      murmurs: @murmurs.map { |murmur| murmur_json(murmur) },
      pagination: {
        current_page: @murmurs.current_page,
        total_pages: @murmurs.total_pages,
        total_count: @murmurs.total_count
      }
    }
  end
  
  def show
    @murmur = Murmur.includes(:user).find_by(id: params[:id])
    
    if @murmur
      render json: murmur_json(@murmur)
    else
      render_error "Murmur not found", :not_found
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
