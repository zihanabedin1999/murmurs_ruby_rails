class Api::LikesController < Api::BaseController
  before_action :set_murmur
  
  def create
    return render_error "Murmur not found", :not_found unless @murmur
    
    if @murmur.liked_by?(current_user)
      render_error "You already liked this murmur"
      return
    end
    
    @like = current_user.likes.build(murmur: @murmur)
    
    if @like.save
      render json: { 
        success: true, 
        like_count: @murmur.reload.like_count 
      }
    else
      render_error @like.errors.full_messages.join(", ")
    end
  end
  
  def destroy
    return render_error "Murmur not found", :not_found unless @murmur
    
    @like = current_user.likes.find_by(murmur: @murmur)
    
    if @like
      if @like.destroy
        render json: { 
          success: true, 
          like_count: @murmur.reload.like_count 
        }
      else
        render_error "Failed to unlike murmur"
      end
    else
      render_error "You haven't liked this murmur yet"
    end
  end
  
  private
  
  def set_murmur
    @murmur = Murmur.find_by(id: params[:murmur_id])
  end
end
