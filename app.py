import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///murmur.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
db = SQLAlchemy(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    bio = db.Column(db.String(500))
    profile_image = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    murmurs = db.relationship('Murmur', backref='author', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'username': self.username,
            'email': self.email,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Murmur(db.Model):
    __tablename__ = 'murmurs'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(280), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    media_type = db.Column(db.String(20))  # 'image', 'video', 'audio', or null
    media_url = db.Column(db.Text)  # URL or base64 data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    likes = db.relationship('Like', backref='murmur', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        user = User.query.get(self.user_id)
        user_data = user.to_dict() if user else None
        
        return {
            'id': self.id,
            'content': self.content,
            'user_id': self.user_id,
            'author': user_data,
            'media_type': self.media_type,
            'media_url': self.media_url,
            'likes_count': Like.query.filter_by(murmur_id=self.id).count(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    murmur_id = db.Column(db.Integer, db.ForeignKey('murmurs.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add unique constraint to prevent multiple likes from same user
    __table_args__ = (db.UniqueConstraint('user_id', 'murmur_id', name='unique_user_murmur_like'),)

class Follow(db.Model):
    __tablename__ = 'follows'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add unique constraint to prevent duplicate follows
    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='unique_follower_followed'),)

# Create all tables
with app.app_context():
    db.create_all()

# User Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if user with email or username already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Create new user
    new_user = User(
        name=data.get('name'),
        username=data.get('username'),
        email=data.get('email'),
        bio=data.get('bio', f"Hi, I'm {data.get('name')}!")
    )
    new_user.set_password(data.get('password'))
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    
    # Find user by email
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Return user data (in a real app, you'd return a JWT token)
    return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200

# Murmur Routes
@app.route('/api/murmurs', methods=['GET'])
def get_murmurs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get murmurs with pagination
    murmurs = Murmur.query.order_by(Murmur.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'murmurs': [murmur.to_dict() for murmur in murmurs.items],
        'total': murmurs.total,
        'pages': murmurs.pages,
        'current_page': page
    }), 200

@app.route('/api/me/murmurs', methods=['POST'])
def create_murmur():
    data = request.json
    
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = data.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Validate content
    content = data.get('content', '').strip()
    if not content and not (data.get('media_type') and data.get('media_url')):
        return jsonify({'error': 'Murmur must have content or media'}), 400
    
    if len(content) > 280:
        return jsonify({'error': 'Content exceeds maximum length of 280 characters'}), 400
    
    # Create murmur
    new_murmur = Murmur(
        content=content,
        user_id=user_id,
        media_type=data.get('media_type'),
        media_url=data.get('media_url')
    )
    
    db.session.add(new_murmur)
    db.session.commit()
    
    return jsonify({'message': 'Murmur created successfully', 'murmur': new_murmur.to_dict()}), 201

@app.route('/api/me/murmurs/<int:murmur_id>', methods=['DELETE'])
def delete_murmur(murmur_id):
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.args.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Find the murmur
    murmur = Murmur.query.get(murmur_id)
    
    # Check if murmur exists
    if not murmur:
        return jsonify({'error': 'Murmur not found'}), 404
    
    # Check if the user is the author
    if murmur.user_id != int(user_id):
        return jsonify({'error': 'Unauthorized to delete this murmur'}), 403
    
    # Delete the murmur
    db.session.delete(murmur)
    db.session.commit()
    
    return jsonify({'message': 'Murmur deleted successfully'}), 200

# Additional Murmur Routes
@app.route('/api/murmurs/<int:murmur_id>', methods=['GET'])
def get_murmur(murmur_id):
    murmur = Murmur.query.get(murmur_id)
    
    if not murmur:
        return jsonify({'error': 'Murmur not found'}), 404
    
    return jsonify({'murmur': murmur.to_dict()}), 200

@app.route('/api/users/<int:user_id>/murmurs', methods=['GET'])
def get_user_murmurs(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's murmurs with pagination
    murmurs = Murmur.query.filter_by(user_id=user_id).order_by(Murmur.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'murmurs': [murmur.to_dict() for murmur in murmurs.items],
        'total': murmurs.total,
        'pages': murmurs.pages,
        'current_page': page,
        'user': user.to_dict()
    }), 200

# Like/Unlike Routes
@app.route('/api/murmurs/<int:murmur_id>/like', methods=['POST'])
def like_murmur(murmur_id):
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.json.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Check if murmur exists
    murmur = Murmur.query.get(murmur_id)
    if not murmur:
        return jsonify({'error': 'Murmur not found'}), 404
    
    # Check if like already exists
    existing_like = Like.query.filter_by(user_id=user_id, murmur_id=murmur_id).first()
    if existing_like:
        return jsonify({'error': 'Already liked this murmur'}), 400
    
    # Create like
    new_like = Like(user_id=user_id, murmur_id=murmur_id)
    db.session.add(new_like)
    db.session.commit()
    
    return jsonify({'message': 'Murmur liked successfully', 'likes_count': len(murmur.likes)}), 201

@app.route('/api/murmurs/<int:murmur_id>/unlike', methods=['DELETE'])
def unlike_murmur(murmur_id):
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.json.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Check if murmur exists
    murmur = Murmur.query.get(murmur_id)
    if not murmur:
        return jsonify({'error': 'Murmur not found'}), 404
    
    # Find the like
    like = Like.query.filter_by(user_id=user_id, murmur_id=murmur_id).first()
    if not like:
        return jsonify({'error': 'Not liked this murmur yet'}), 400
    
    # Remove like
    db.session.delete(like)
    db.session.commit()
    
    return jsonify({'message': 'Murmur unliked successfully', 'likes_count': len(murmur.likes)}), 200

# Search Users
@app.route('/api/users/search', methods=['GET'])
def search_users():
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    # Search for users with LIKE pattern matching on name, username, and bio
    search_pattern = f"%{query}%"
    users = User.query.filter(
        db.or_(
            User.name.ilike(search_pattern),
            User.username.ilike(search_pattern),
            User.bio.ilike(search_pattern)
        )
    ).paginate(page=page, per_page=per_page)
    
    user_list = []
    for user in users.items:
        user_data = user.to_dict()
        # Add follower and following counts
        user_data['followers_count'] = Follow.query.filter_by(followed_id=user.id).count()
        user_data['following_count'] = Follow.query.filter_by(follower_id=user.id).count()
        user_data['murmurs_count'] = Murmur.query.filter_by(user_id=user.id).count()
        user_list.append(user_data)
    
    return jsonify({
        'users': user_list,
        'total': users.total,
        'pages': users.pages,
        'current_page': page,
        'query': query
    }), 200

# User Profile Routes
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get followers and following counts
    followers_count = Follow.query.filter_by(followed_id=user_id).count()
    following_count = Follow.query.filter_by(follower_id=user_id).count()
    murmurs_count = Murmur.query.filter_by(user_id=user_id).count()
    
    user_data = user.to_dict()
    user_data['followers_count'] = followers_count
    user_data['following_count'] = following_count
    user_data['murmurs_count'] = murmurs_count
    
    return jsonify({'user': user_data}), 200

@app.route('/api/me/profile', methods=['PUT'])
def update_profile():
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.json.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Find the user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    
    # Check if username is being changed and if it's available
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 400
    
    # Update user attributes
    if 'name' in data:
        user.name = data['name']
    if 'username' in data:
        user.username = data['username']
    if 'bio' in data:
        user.bio = data['bio']
    if 'profile_image' in data:
        user.profile_image = data['profile_image']
    
    db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200

@app.route('/api/me/profile/upload-image', methods=['POST'])
def upload_profile_image():
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.form.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Find the user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if image file is present in request
    if 'profile_image' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['profile_image']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check file type (only allow images)
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if not '.' in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type. Only images are allowed (PNG, JPG, JPEG, GIF)'}), 400
    
    # In a real application, you'd save the file to a storage service (S3, etc.)
    # For this demo, we'll encode the image as base64 and save it in the database
    import base64
    encoded_image = base64.b64encode(file.read()).decode('utf-8')
    user.profile_image = f"data:image/{file.filename.rsplit('.', 1)[1].lower()};base64,{encoded_image}"
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile image uploaded successfully',
        'profile_image_url': user.profile_image,
        'user': user.to_dict()
    }), 200

# Follow/Unfollow Routes
@app.route('/api/users/<int:user_id>/follow', methods=['POST'])
def follow_user(user_id):
    # Get follower ID from auth token (for now, we'll use a placeholder)
    follower_id = request.json.get('follower_id')  # In a real app, get this from the auth token
    
    if not follower_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Check if users exist
    followed_user = User.query.get(user_id)
    follower_user = User.query.get(follower_id)
    
    if not followed_user or not follower_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if already following
    existing_follow = Follow.query.filter_by(follower_id=follower_id, followed_id=user_id).first()
    if existing_follow:
        return jsonify({'error': 'Already following this user'}), 400
    
    # Create follow relationship
    new_follow = Follow(follower_id=follower_id, followed_id=user_id)
    db.session.add(new_follow)
    db.session.commit()
    
    return jsonify({'message': 'User followed successfully'}), 201

@app.route('/api/users/<int:user_id>/unfollow', methods=['DELETE'])
def unfollow_user(user_id):
    # Get follower ID from auth token (for now, we'll use a placeholder)
    follower_id = request.json.get('follower_id')  # In a real app, get this from the auth token
    
    if not follower_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Find the follow relationship
    follow = Follow.query.filter_by(follower_id=follower_id, followed_id=user_id).first()
    
    if not follow:
        return jsonify({'error': 'Not following this user'}), 400
    
    # Remove follow relationship
    db.session.delete(follow)
    db.session.commit()
    
    return jsonify({'message': 'User unfollowed successfully'}), 200

@app.route('/api/users/<int:user_id>/followers', methods=['GET'])
def get_followers(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's followers
    follows = Follow.query.filter_by(followed_id=user_id).paginate(page=page, per_page=per_page)
    followers = [User.query.get(follow.follower_id).to_dict() for follow in follows.items]
    
    return jsonify({
        'followers': followers,
        'total': follows.total,
        'pages': follows.pages,
        'current_page': page
    }), 200

@app.route('/api/users/<int:user_id>/following', methods=['GET'])
def get_following(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get users that this user is following
    follows = Follow.query.filter_by(follower_id=user_id).paginate(page=page, per_page=per_page)
    following = [User.query.get(follow.followed_id).to_dict() for follow in follows.items]
    
    return jsonify({
        'following': following,
        'total': follows.total,
        'pages': follows.pages,
        'current_page': page
    }), 200

@app.route('/api/timeline', methods=['GET'])
def get_timeline():
    # Get user ID from auth token (for now, we'll use a placeholder)
    user_id = request.args.get('user_id')  # In a real app, get this from the auth token
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get IDs of users that the current user is following
    following_ids = [f.followed_id for f in Follow.query.filter_by(follower_id=user_id).all()]
    # Include the user's own murmurs
    following_ids.append(int(user_id))
    
    # Get murmurs from followed users and the user themselves
    timeline = Murmur.query.filter(Murmur.user_id.in_(following_ids)).order_by(Murmur.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'murmurs': [murmur.to_dict() for murmur in timeline.items],
        'total': timeline.total,
        'pages': timeline.pages,
        'current_page': page
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)