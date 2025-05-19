class Like < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :murmur
  
  # Validations
  validates :user_id, presence: true
  validates :murmur_id, presence: true
  validates :user_id, uniqueness: { scope: :murmur_id, message: "has already liked this murmur" }
end
