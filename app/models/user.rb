class User < ApplicationRecord
  has_secure_password

  # Associations
  has_many :murmurs, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :liked_murmurs, through: :likes, source: :murmur
  
  # Follow associations
  has_many :active_follows, class_name: "Follow", foreign_key: "follower_id", dependent: :destroy
  has_many :passive_follows, class_name: "Follow", foreign_key: "followed_id", dependent: :destroy
  has_many :following, through: :active_follows, source: :followed
  has_many :followers, through: :passive_follows, source: :follower
  
  # Validations
  validates :username, presence: true, uniqueness: true, 
            format: { with: /\A[a-zA-Z0-9_]+\z/, message: "only allows letters, numbers and underscore" },
            length: { in: 3..20 }
  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, uniqueness: true, 
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }, if: :password_digest_changed?
  validates :bio, length: { maximum: 160 }
  
  # Avatar handling
  def avatar_url
    # Using default avatars for simplicity
    "avatars/avatar#{id % 6 + 1}.jpg"
  end
  
  # Follow a user
  def follow(other_user)
    following << other_user unless self == other_user
  end
  
  # Unfollow a user
  def unfollow(other_user)
    following.delete(other_user)
  end
  
  # Checks if current user is following another user
  def following?(other_user)
    following.include?(other_user)
  end
  
  # Timeline murmurs (own + following)
  def timeline
    following_ids = "SELECT followed_id FROM follows WHERE follower_id = :user_id"
    Murmur.where("user_id IN (#{following_ids}) OR user_id = :user_id", user_id: id)
          .order(created_at: :desc)
  end
end
