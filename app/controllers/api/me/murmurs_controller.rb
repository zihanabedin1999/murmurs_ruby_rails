class Api::Me::MurmursController < Api::BaseController
  def create
    @murmur = current_user.murmurs.build(murmur_params)
    
    if @murmur.save
      render json: { 
        success: true, 
        murmur: {
          id: @murmur.id,
          content: @murmur.content,
          created_at: @murmur.created_at,
          formatted_date: @murmur.formatted_date,
          like_count: 0,
          liked_by_current_user: false
        }
      }, status: :created
    else
      render_error @murmur.errors.full_messages.join(", ")
    end
  end
  
  def destroy
    @murmur = current_user.murmurs.find_by(id: params[:id])
    
    if @murmur
      if @murmur.destroy
        render json: { success: true }
      else
        render_error "Failed to delete murmur"
      end
    else
      render_error "Murmur not found or you don't have permission to delete it", :not_found
    end
  end
  
  private
  
  def murmur_params
    params.require(:murmur).permit(:content)
  end
end
