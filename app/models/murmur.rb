class Murmur < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :likes, dependent: :destroy
  has_many :liking_users, through: :likes, source: :user
  
  # Validations
  validates :content, presence: true, length: { maximum: 280 }
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  
  # Instance methods
  def liked_by?(user)
    return false unless user
    likes.exists?(user_id: user.id)
  end
  
  def like_count
    likes.count
  end
  
  # Format the created_at date for display
  def formatted_date
    created_at.strftime("%b %d, %Y")
  end
end
