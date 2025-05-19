class CreateMurmurs < ActiveRecord::Migration[6.1]
  def change
    create_table :murmurs do |t|
      t.references :user, null: false, foreign_key: true
      t.text :content, null: false

      t.timestamps
    end
    
    add_index :murmurs, [:user_id, :created_at]
  end
end
