// Core functionality for Murmur app

// Media preview functionality
function setupMediaPreview() {
    // Image upload preview
    const imageUpload = document.getElementById('image-upload');
    const videoUpload = document.getElementById('video-upload');
    const audioUpload = document.getElementById('audio-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const audioPreviewContainer = document.getElementById('audio-preview-container');
    const mediaPreviewContainer = document.getElementById('media-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const videoPreview = document.getElementById('video-preview');
    const audioPreview = document.getElementById('audio-preview');
    const removeMediaBtn = document.getElementById('remove-media-btn');
    
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Hide other preview containers
                    videoPreviewContainer.classList.add('hidden');
                    audioPreviewContainer.classList.add('hidden');
                    
                    // Show image preview
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('hidden');
                    mediaPreviewContainer.classList.remove('hidden');
                    
                    // Store media data
                    currentMedia = {
                        type: 'image',
                        data: e.target.result
                    };
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (videoUpload) {
        videoUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Hide other preview containers
                    imagePreviewContainer.classList.add('hidden');
                    audioPreviewContainer.classList.add('hidden');
                    
                    // Show video preview
                    videoPreview.src = e.target.result;
                    videoPreviewContainer.classList.remove('hidden');
                    mediaPreviewContainer.classList.remove('hidden');
                    
                    // Store media data
                    currentMedia = {
                        type: 'video',
                        data: e.target.result
                    };
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (audioUpload) {
        audioUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Hide other preview containers
                    imagePreviewContainer.classList.add('hidden');
                    videoPreviewContainer.classList.add('hidden');
                    
                    // Show audio preview
                    audioPreview.src = e.target.result;
                    audioPreviewContainer.classList.remove('hidden');
                    mediaPreviewContainer.classList.remove('hidden');
                    
                    // Store media data
                    currentMedia = {
                        type: 'audio',
                        data: e.target.result
                    };
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove media button
    if (removeMediaBtn) {
        removeMediaBtn.addEventListener('click', function() {
            // Clear file inputs
            if (imageUpload) imageUpload.value = '';
            if (videoUpload) videoUpload.value = '';
            if (audioUpload) audioUpload.value = '';
            
            // Hide preview
            mediaPreviewContainer.classList.add('hidden');
            imagePreviewContainer.classList.add('hidden');
            videoPreviewContainer.classList.add('hidden');
            audioPreviewContainer.classList.add('hidden');
            
            // Clear stored media
            currentMedia = null;
        });
    }
    
    // Character counter for murmur content
    const murmurContent = document.getElementById('murmur-content');
    const charCount = document.getElementById('char-count');
    
    if (murmurContent && charCount) {
        murmurContent.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Change color as it approaches limit
            if (count > 280) {
                charCount.classList.add('text-red-500');
            } else if (count > 250) {
                charCount.classList.add('text-yellow-500');
                charCount.classList.remove('text-red-500');
            } else {
                charCount.classList.remove('text-yellow-500', 'text-red-500');
            }
        });
    }
}

// Login and logout functionality
function setupLoginLogout() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const result = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await result.json();
                
                if (result.ok) {
                    // Store user data in localStorage
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // Close modal
                    document.getElementById('login-modal').classList.add('hidden');
                    
                    // Update UI
                    updateAuthUI();
                    
                    // Show success message
                    showFlashMessage('success', 'Logged in successfully!');
                    
                    // Reload content
                    loadAllMurmurs();
                } else {
                    showFlashMessage('error', data.error || 'Failed to log in');
                }
            } catch (error) {
                console.error('Login error:', error);
                showFlashMessage('error', 'An error occurred during login');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Validate input
            if (password !== confirmPassword) {
                showFlashMessage('error', 'Passwords do not match');
                return;
            }
            
            try {
                const result = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, username, email, password })
                });
                
                const data = await result.json();
                
                if (result.ok) {
                    // Store user data in localStorage
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    // Close modal
                    document.getElementById('register-modal').classList.add('hidden');
                    
                    // Update UI
                    updateAuthUI();
                    
                    // Show success message
                    showFlashMessage('success', 'Registered successfully!');
                    
                    // Reload content
                    loadAllMurmurs();
                } else {
                    showFlashMessage('error', data.error || 'Failed to register');
                }
            } catch (error) {
                console.error('Register error:', error);
                showFlashMessage('error', 'An error occurred during registration');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear user data from localStorage
            localStorage.removeItem('currentUser');
            
            // Update UI
            updateAuthUI();
            
            // Show success message
            showFlashMessage('success', 'Logged out successfully!');
            
            // Reload content (showing public murmurs)
            loadAllMurmurs();
        });
    }
    
    // Sidebar login button
    const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
    if (sidebarLoginBtn) {
        sidebarLoginBtn.addEventListener('click', () => {
            document.getElementById('login-modal').classList.remove('hidden');
        });
    }
}

// Post new murmur functionality
async function postNewMurmur(content, mediaType, mediaData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showFlashMessage('error', 'You must be logged in to post');
        return null;
    }
    
    try {
        const response = await fetch('/api/me/murmurs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                content,
                media_type: mediaType,
                media_url: mediaData
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data.murmur;
        } else {
            throw new Error(data.error || 'Failed to post murmur');
        }
    } catch (error) {
        console.error('Error posting murmur:', error);
        showFlashMessage('error', error.message || 'Error posting murmur');
        return null;
    }
}

// Delete murmur functionality
async function deleteMurmur(murmurId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showFlashMessage('error', 'You must be logged in to delete murmurs');
        return false;
    }
    
    try {
        const response = await fetch(`/api/me/murmurs/${murmurId}?user_id=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return true;
        } else {
            throw new Error(data.error || 'Failed to delete murmur');
        }
    } catch (error) {
        console.error('Error deleting murmur:', error);
        showFlashMessage('error', error.message || 'Error deleting murmur');
        return false;
    }
}

// Like/unlike functionality
async function toggleLike(murmurId, isLiked) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showFlashMessage('error', 'You must be logged in to like murmurs');
        return null;
    }
    
    try {
        let response;
        
        if (isLiked) {
            // Unlike
            response = await fetch(`/api/murmurs/${murmurId}/unlike`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUser.id
                })
            });
        } else {
            // Like
            response = await fetch(`/api/murmurs/${murmurId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUser.id
                })
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            return data.likes_count;
        } else {
            throw new Error(data.error || 'Failed to update like status');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showFlashMessage('error', error.message || 'Error updating like status');
        return null;
    }
}

// Follow/unfollow functionality
async function toggleFollow(userId, isFollowing) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showFlashMessage('error', 'You must be logged in to follow users');
        return false;
    }
    
    try {
        let response;
        
        if (isFollowing) {
            // Unfollow
            response = await fetch(`/api/users/${userId}/unfollow`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    follower_id: currentUser.id
                })
            });
        } else {
            // Follow
            response = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    follower_id: currentUser.id
                })
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            return true;
        } else {
            throw new Error(data.error || 'Failed to update follow status');
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        showFlashMessage('error', error.message || 'Error updating follow status');
        return false;
    }
}

// Search users functionality
async function searchUsers(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }
    
    try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (response.ok) {
            return data.users;
        } else {
            throw new Error(data.error || 'Failed to search users');
        }
    } catch (error) {
        console.error('Error searching users:', error);
        showFlashMessage('error', error.message || 'Error searching users');
        return [];
    }
}

// Get user profile
async function getUserProfile(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
            return data.user;
        } else {
            throw new Error(data.error || 'Failed to get user profile');
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        showFlashMessage('error', error.message || 'Error loading user profile');
        return null;
    }
}

// Get user murmurs
async function getUserMurmurs(userId, page = 1) {
    try {
        const response = await fetch(`/api/users/${userId}/murmurs?page=${page}&per_page=10`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                murmurs: data.murmurs,
                page: data.current_page,
                totalPages: data.pages
            };
        } else {
            throw new Error(data.error || 'Failed to get user murmurs');
        }
    } catch (error) {
        console.error('Error getting user murmurs:', error);
        showFlashMessage('error', error.message || 'Error loading user murmurs');
        return {
            murmurs: [],
            page: 1,
            totalPages: 1
        };
    }
}

// Get all murmurs (explore)
async function getAllMurmurs(page = 1) {
    try {
        const response = await fetch(`/api/murmurs?page=${page}&per_page=10`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                murmurs: data.murmurs,
                page: data.current_page,
                totalPages: data.pages
            };
        } else {
            throw new Error(data.error || 'Failed to get murmurs');
        }
    } catch (error) {
        console.error('Error getting murmurs:', error);
        showFlashMessage('error', error.message || 'Error loading murmurs');
        return {
            murmurs: [],
            page: 1,
            totalPages: 1
        };
    }
}

// Get user timeline
async function getUserTimeline(userId, page = 1) {
    try {
        const response = await fetch(`/api/timeline?user_id=${userId}&page=${page}&per_page=10`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                murmurs: data.murmurs,
                page: data.current_page,
                totalPages: data.pages
            };
        } else {
            throw new Error(data.error || 'Failed to get timeline');
        }
    } catch (error) {
        console.error('Error getting timeline:', error);
        showFlashMessage('error', error.message || 'Error loading timeline');
        return {
            murmurs: [],
            page: 1,
            totalPages: 1
        };
    }
}

// Get followers
async function getFollowers(userId, page = 1) {
    try {
        const response = await fetch(`/api/users/${userId}/followers?page=${page}&per_page=10`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                followers: data.followers,
                page: data.current_page,
                totalPages: data.pages
            };
        } else {
            throw new Error(data.error || 'Failed to get followers');
        }
    } catch (error) {
        console.error('Error getting followers:', error);
        showFlashMessage('error', error.message || 'Error loading followers');
        return {
            followers: [],
            page: 1,
            totalPages: 1
        };
    }
}

// Get following
async function getFollowing(userId, page = 1) {
    try {
        const response = await fetch(`/api/users/${userId}/following?page=${page}&per_page=10`);
        const data = await response.json();
        
        if (response.ok) {
            return {
                following: data.following,
                page: data.current_page,
                totalPages: data.pages
            };
        } else {
            throw new Error(data.error || 'Failed to get following');
        }
    } catch (error) {
        console.error('Error getting following:', error);
        showFlashMessage('error', error.message || 'Error loading following');
        return {
            following: [],
            page: 1,
            totalPages: 1
        };
    }
}

// Show flash messages
function showFlashMessage(type, message) {
    const flashContainer = document.getElementById('flash-container');
    
    // Create message element
    const messageElement = document.createElement('div');
    
    if (type === 'success') {
        messageElement.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
    } else {
        messageElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    }
    
    messageElement.innerHTML = `
        <span class="block sm:inline">${message}</span>
        <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer close-flash">
            <svg class="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
        </span>
    `;
    
    // Add to flash container
    flashContainer.appendChild(messageElement);
    
    // Add close button listener
    messageElement.querySelector('.close-flash').addEventListener('click', () => {
        messageElement.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

// Update UI based on authentication status
function updateAuthUI() {
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    
    // Elements to update
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNav = document.getElementById('user-nav');
    const profileCardLoggedOut = document.getElementById('profile-card-logged-out');
    const profileCardLoggedIn = document.getElementById('profile-card-logged-in');
    const userAvatar = document.getElementById('user-avatar');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserUsername = document.getElementById('sidebar-user-username');
    const userProfileName = document.getElementById('user-profile-name');
    const userProfileUsername = document.getElementById('user-profile-username');
    const viewProfileBtn = document.getElementById('view-profile-btn');
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (userNav) userNav.classList.remove('hidden');
        
        // Update profile card
        if (profileCardLoggedOut) profileCardLoggedOut.classList.add('hidden');
        if (profileCardLoggedIn) profileCardLoggedIn.classList.remove('hidden');
        
        // Update user info
        if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
        if (sidebarUserUsername) sidebarUserUsername.textContent = '@' + currentUser.username;
        if (userProfileName) userProfileName.textContent = currentUser.name;
        if (userProfileUsername) userProfileUsername.textContent = '@' + currentUser.username;
        
        // Set avatar text (first letter of name)
        if (userAvatar) {
            if (currentUser.profile_image) {
                userAvatar.innerHTML = `<img src="${currentUser.profile_image}" alt="${currentUser.name}" class="w-full h-full rounded-full object-cover">`;
            } else {
                userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
                
                // Set random background color based on username
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
                const colorIndex = currentUser.username.charCodeAt(0) % colors.length;
                userAvatar.className = `w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 ${colors[colorIndex]}`;
            }
        }
        
        // Set profile link
        if (viewProfileBtn) {
            viewProfileBtn.href = `#/users/${currentUser.id}`;
        }
        
        // Fetch and update follower/following counts
        fetchUserCounts(currentUser.id);
        
        // Show murmur form
        const murmurForm = document.querySelector('#murmur-form').closest('.bg-white');
        if (murmurForm) {
            murmurForm.classList.remove('hidden');
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (userNav) userNav.classList.add('hidden');
        
        // Update profile card
        if (profileCardLoggedOut) profileCardLoggedOut.classList.remove('hidden');
        if (profileCardLoggedIn) profileCardLoggedIn.classList.add('hidden');
        
        // Hide murmur form
        const murmurForm = document.querySelector('#murmur-form').closest('.bg-white');
        if (murmurForm) {
            murmurForm.classList.add('hidden');
        }
    }
}

// Fetch user follower/following counts
async function fetchUserCounts(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
            const user = data.user;
            
            // Update sidebar counts
            const followingCount = document.getElementById('sidebar-following-count');
            const followersCount = document.getElementById('sidebar-followers-count');
            
            if (followingCount) followingCount.textContent = user.following_count;
            if (followersCount) followersCount.textContent = user.followers_count;
        }
    } catch (error) {
        console.error('Error fetching user counts:', error);
    }
}

// Helper function to create user avatar
function createUserAvatar(user, size = 'small') {
    let sizeClasses = 'w-8 h-8';
    let textSizeClass = 'text-sm';
    
    if (size === 'medium') {
        sizeClasses = 'w-12 h-12';
        textSizeClass = 'text-lg';
    } else if (size === 'large') {
        sizeClasses = 'w-16 h-16';
        textSizeClass = 'text-2xl';
    } else if (size === 'xlarge') {
        sizeClasses = 'w-24 h-24';
        textSizeClass = 'text-4xl';
    }
    
    // Create the avatar element
    const avatar = document.createElement('div');
    
    // Choose background color based on username
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = user.username.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    if (user.profile_image) {
        avatar.className = `${sizeClasses} rounded-full overflow-hidden`;
        avatar.innerHTML = `<img src="${user.profile_image}" alt="${user.name}" class="w-full h-full object-cover">`;
    } else {
        avatar.className = `${sizeClasses} rounded-full ${bgColor} flex items-center justify-center text-white font-bold ${textSizeClass}`;
        avatar.textContent = user.name.charAt(0).toUpperCase();
    }
    
    return avatar;
}

// Helper functions to create HTML for various components

// Create user list item
function createUserListItem(user) {
    const item = document.createElement('div');
    item.className = 'flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer border-b';
    
    // Create avatar
    const avatar = createUserAvatar(user, 'medium');
    
    // Create user info
    const info = document.createElement('div');
    info.className = 'ml-3';
    info.innerHTML = `
        <div class="font-semibold">${user.name}</div>
        <div class="text-gray-500 text-sm">@${user.username}</div>
    `;
    
    // Create follow button if logged in
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    
    if (currentUser && currentUser.id !== user.id) {
        const followBtn = document.createElement('button');
        followBtn.className = 'ml-auto bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full';
        followBtn.textContent = 'Follow';
        followBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const success = await toggleFollow(user.id, false);
            if (success) {
                followBtn.textContent = 'Following';
                followBtn.className = 'ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3 py-1 rounded-full';
            }
        });
        
        item.appendChild(followBtn);
    }
    
    item.appendChild(avatar);
    item.appendChild(info);
    
    // Add click handler to go to user profile
    item.addEventListener('click', () => {
        window.location.hash = `#/users/${user.id}`;
    });
    
    return item;
}

// Create murmur card
function createMurmurCard(murmur) {
    const card = document.createElement('div');
    card.className = 'border-b p-4 hover:bg-gray-50';
    card.dataset.murmurId = murmur.id;
    
    // Get author info
    const author = murmur.author;
    
    // Format date
    const date = new Date(murmur.created_at);
    const formattedDate = date.toLocaleString();
    
    // Check if current user has liked this murmur
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    let isLiked = false;
    // For now, we'll determine this on the client side
    if (currentUser) {
        const likedMurmurs = JSON.parse(localStorage.getItem(`user_${currentUser.id}_likes`) || '[]');
        isLiked = likedMurmurs.includes(murmur.id);
    }
    
    // Check if current user is the author
    const isAuthor = currentUser && currentUser.id === murmur.author.id;
    
    // Create avatar
    const avatar = createUserAvatar(author, 'medium');
    
    // Create HTML content
    card.innerHTML = `
        <div class="flex">
            <a href="#/users/${author.id}" class="flex-shrink-0">
                <div class="avatar-container mr-3"></div>
            </a>
            <div class="flex-grow">
                <div class="flex items-center mb-1">
                    <a href="#/users/${author.id}" class="font-bold hover:underline">${author.name}</a>
                    <a href="#/users/${author.id}" class="text-gray-500 text-sm ml-2 hover:underline">@${author.username}</a>
                    <span class="text-gray-400 text-sm ml-2">• ${formattedDate}</span>
                </div>
                <p class="mb-2 whitespace-pre-wrap">${murmur.content}</p>
                
                ${murmur.media_url ? createMediaElement(murmur) : ''}
                
                <div class="flex items-center mt-2 text-gray-500">
                    <button class="like-button flex items-center mr-4 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}" data-murmur-id="${murmur.id}">
                        <svg class="w-5 h-5 mr-1" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span class="like-count">${murmur.likes_count}</span>
                    </button>
                    
                    <a href="#/murmurs/${murmur.id}" class="flex items-center mr-4 hover:text-blue-500">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>View</span>
                    </a>
                    
                    ${isAuthor ? `
                        <button class="delete-button flex items-center hover:text-red-500" data-murmur-id="${murmur.id}">
                            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            <span>Delete</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Insert avatar into container
    const avatarContainer = card.querySelector('.avatar-container');
    avatarContainer.appendChild(avatar);
    
    // Add event listeners
    
    // Like button
    const likeButton = card.querySelector('.like-button');
    likeButton.addEventListener('click', async () => {
        if (!currentUser) {
            showFlashMessage('error', 'Please log in to like murmurs');
            return;
        }
        
        const murmurId = likeButton.dataset.murmurId;
        const isCurrentlyLiked = likeButton.classList.contains('text-red-500');
        
        const newLikeCount = await toggleLike(murmurId, isCurrentlyLiked);
        
        if (newLikeCount !== null) {
            // Update UI
            if (isCurrentlyLiked) {
                likeButton.classList.remove('text-red-500');
                likeButton.querySelector('svg').setAttribute('fill', 'none');
                
                // Update localStorage
                const likedMurmurs = JSON.parse(localStorage.getItem(`user_${currentUser.id}_likes`) || '[]');
                const updatedLikes = likedMurmurs.filter(id => id !== murmurId);
                localStorage.setItem(`user_${currentUser.id}_likes`, JSON.stringify(updatedLikes));
            } else {
                likeButton.classList.add('text-red-500');
                likeButton.querySelector('svg').setAttribute('fill', 'currentColor');
                
                // Update localStorage
                const likedMurmurs = JSON.parse(localStorage.getItem(`user_${currentUser.id}_likes`) || '[]');
                likedMurmurs.push(murmurId);
                localStorage.setItem(`user_${currentUser.id}_likes`, JSON.stringify(likedMurmurs));
            }
            
            // Update like count
            card.querySelector('.like-count').textContent = newLikeCount;
        }
    });
    
    // Delete button
    const deleteButton = card.querySelector('.delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this murmur?')) {
                const murmurId = deleteButton.dataset.murmurId;
                const success = await deleteMurmur(murmurId);
                
                if (success) {
                    // Remove card from DOM
                    card.remove();
                    showFlashMessage('success', 'Murmur deleted successfully');
                }
            }
        });
    }
    
    return card;
}

// Create media element based on media type
function createMediaElement(murmur) {
    if (!murmur.media_url || !murmur.media_type) {
        return '';
    }
    
    switch (murmur.media_type) {
        case 'image':
            return `
                <div class="mb-3 rounded-lg overflow-hidden">
                    <img src="${murmur.media_url}" alt="Murmur image" class="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90" onclick="window.openMediaInLightbox('${murmur.id}', '${murmur.media_url}')">
                </div>
            `;
        case 'video':
            return `
                <div class="mb-3 rounded-lg overflow-hidden">
                    <video src="${murmur.media_url}" controls class="max-w-full h-auto rounded-lg"></video>
                </div>
            `;
        case 'audio':
            return `
                <div class="mb-3">
                    <audio src="${murmur.media_url}" controls class="w-full"></audio>
                </div>
            `;
        default:
            return '';
    }
}

// Create pagination controls
function createPagination(currentPage, totalPages, type) {
    const container = document.createElement('div');
    container.className = 'flex justify-center my-4';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded mx-1 ${currentPage > 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`;
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage <= 1;
    prevButton.dataset.page = currentPage - 1;
    prevButton.dataset.type = type;
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded mx-1 ${currentPage < totalPages ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`;
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.dataset.page = currentPage + 1;
    nextButton.dataset.type = type;
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'mx-2 flex items-center text-sm text-gray-600';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    container.appendChild(prevButton);
    container.appendChild(pageInfo);
    container.appendChild(nextButton);
    
    return container;
}

// Global function to open media in lightbox
window.openMediaInLightbox = function(murmurId, mediaUrl) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    
    // Create image
    const img = document.createElement('img');
    img.src = mediaUrl;
    img.className = 'max-w-4xl max-h-screen p-4';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-white text-4xl';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(lightbox);
    });
    
    // Add click on background to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
        }
    });
    
    lightbox.appendChild(img);
    lightbox.appendChild(closeButton);
    document.body.appendChild(lightbox);
};