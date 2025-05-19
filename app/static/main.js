// Main application functionality for the Murmur app
// Handles user search, profile viewing, posting/liking/deleting murmurs, and following/unfollowing

// Global variables for media upload
let currentMedia = null; // Store currently uploaded media

document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    setupSearchFunctionality();
    setupNavigationHandlers();
    setupMurmurForm();
    setupMediaUpload();
    setupLoginRegister();
    
    // Load initial content (explore page)
    loadExploreContent();
    
    // Initialize user state
    updateUserInterface();
});

// ===========================================
// AUTHENTICATION FUNCTIONS
// ===========================================

function setupLoginRegister() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Simple login validation
            if (email && password) {
                // Store user info in localStorage for demo
                const user = {
                    id: 1,
                    name: "Demo User",
                    username: "demouser",
                    email: email,
                    bio: "This is a demo account",
                    profile_image: null
                };
                
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Hide modal
                document.getElementById('login-modal').classList.add('hidden');
                
                // Update UI
                updateUserInterface();
                
                // Show success message
                showMessage('success', 'Logged in successfully!');
                
                // Reload content
                loadTimelineContent();
            } else {
                showMessage('error', 'Please fill in all fields');
            }
        });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            // Simple validation
            if (name && username && email && password && confirmPassword) {
                if (password !== confirmPassword) {
                    showMessage('error', 'Passwords do not match');
                    return;
                }
                
                // Store user info in localStorage for demo
                const user = {
                    id: 1,
                    name: name,
                    username: username,
                    email: email,
                    bio: `Hi, I'm ${name}!`,
                    profile_image: null
                };
                
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Hide modal
                document.getElementById('register-modal').classList.add('hidden');
                
                // Update UI
                updateUserInterface();
                
                // Show success message
                showMessage('success', 'Registered and logged in successfully!');
                
                // Reload content
                loadTimelineContent();
            } else {
                showMessage('error', 'Please fill in all fields');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear user data
            localStorage.removeItem('currentUser');
            
            // Update UI
            updateUserInterface();
            
            // Show message
            showMessage('success', 'Logged out successfully');
            
            // Load explore page
            loadExploreContent();
        });
    }
}

function updateUserInterface() {
    const currentUser = getCurrentUser();
    
    // Update navbar
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userNav = document.getElementById('user-nav');
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (userNav) userNav.classList.remove('hidden');
        
        // Update user info in navbar
        const userProfileName = document.getElementById('user-profile-name');
        const userProfileUsername = document.getElementById('user-profile-username');
        
        if (userProfileName) userProfileName.textContent = currentUser.name;
        if (userProfileUsername) userProfileUsername.textContent = '@' + currentUser.username;
        
        // Update sidebar profile
        updateSidebarProfile(currentUser);
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (userNav) userNav.classList.add('hidden');
        
        // Update sidebar
        const profileCardLoggedOut = document.getElementById('profile-card-logged-out');
        const profileCardLoggedIn = document.getElementById('profile-card-logged-in');
        
        if (profileCardLoggedOut) profileCardLoggedOut.classList.remove('hidden');
        if (profileCardLoggedIn) profileCardLoggedIn.classList.add('hidden');
    }
}

function updateSidebarProfile(user) {
    // Update sidebar profile card
    const profileCardLoggedOut = document.getElementById('profile-card-logged-out');
    const profileCardLoggedIn = document.getElementById('profile-card-logged-in');
    
    if (profileCardLoggedOut) profileCardLoggedOut.classList.add('hidden');
    if (profileCardLoggedIn) profileCardLoggedIn.classList.remove('hidden');
    
    // Update profile info
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserUsername = document.getElementById('sidebar-user-username');
    const userAvatar = document.getElementById('user-avatar');
    
    if (sidebarUserName) sidebarUserName.textContent = user.name;
    if (sidebarUserUsername) sidebarUserUsername.textContent = '@' + user.username;
    
    // Update avatar
    if (userAvatar) {
        if (user.profile_image) {
            userAvatar.innerHTML = `<img src="${user.profile_image}" alt="${user.name}" class="w-full h-full rounded-full object-cover">`;
        } else {
            userAvatar.innerHTML = user.name.charAt(0).toUpperCase();
            
            // Set random color based on username
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
            const colorIndex = user.username.charCodeAt(0) % colors.length;
            userAvatar.className = `w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 ${colors[colorIndex]}`;
        }
    }
    
    // Update counts
    const followingCount = document.getElementById('sidebar-following-count');
    const followersCount = document.getElementById('sidebar-followers-count');
    
    if (followingCount) followingCount.textContent = '0'; // Demo value
    if (followersCount) followersCount.textContent = '0'; // Demo value
    
    // Update profile link
    const viewProfileBtn = document.getElementById('view-profile-btn');
    if (viewProfileBtn) {
        viewProfileBtn.onclick = function() {
            loadUserProfile(user.id);
        };
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// ===========================================
// NAVIGATION FUNCTIONS
// ===========================================

function setupNavigationHandlers() {
    // Home button (timeline)
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadTimelineContent();
        });
    }
    
    // Explore button
    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadExploreContent();
        });
    }
    
    // Sidebar login button
    const sidebarLoginBtn = document.getElementById('sidebar-login-btn');
    if (sidebarLoginBtn) {
        sidebarLoginBtn.addEventListener('click', function() {
            document.getElementById('login-modal').classList.remove('hidden');
        });
    }
}

// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================

function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput && searchResults) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            if (searchInput.value.trim().length < 2) {
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
                return;
            }
            
            searchTimeout = setTimeout(function() {
                // Demo search results
                const results = searchUsers(searchInput.value.trim());
                
                if (results.length === 0) {
                    searchResults.innerHTML = '<div class="p-4 text-center text-gray-500">No users found</div>';
                } else {
                    searchResults.innerHTML = '';
                    
                    results.forEach(function(user) {
                        const userElement = document.createElement('a');
                        userElement.href = "#";
                        userElement.className = 'block hover:bg-gray-100 px-4 py-2 border-b border-gray-200';
                        
                        // Generate avatar color
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
                        const colorIndex = user.username.charCodeAt(0) % colors.length;
                        const avatarColor = colors[colorIndex];
                        
                        userElement.innerHTML = `
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold mr-3">
                                    ${user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div class="font-medium">${user.name}</div>
                                    <div class="text-sm text-gray-500">@${user.username}</div>
                                </div>
                            </div>
                        `;
                        
                        userElement.addEventListener('click', function(e) {
                            e.preventDefault();
                            searchResults.classList.add('hidden');
                            loadUserProfile(user.id);
                        });
                        
                        searchResults.appendChild(userElement);
                    });
                }
                
                searchResults.classList.remove('hidden');
            }, 300);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
}

// Demo search implementation
function searchUsers(query) {
    // These are hard-coded demo users
    const demoUsers = [
        {
            id: 1,
            name: "John Doe",
            username: "johndoe",
            bio: "Software engineer and tech enthusiast"
        },
        {
            id: 2,
            name: "Jane Smith",
            username: "janesmith",
            bio: "Digital marketer and coffee lover"
        },
        {
            id: 3,
            name: "Bob Johnson",
            username: "bobjohnson",
            bio: "Travel blogger and photographer"
        },
        {
            id: 4,
            name: "Alice Williams",
            username: "alicewilliams",
            bio: "Artist and designer"
        },
        {
            id: 5,
            name: "Charlie Brown",
            username: "charliebrown",
            bio: "Music producer and DJ"
        }
    ];
    
    // Filter users based on search query
    return demoUsers.filter(function(user) {
        return user.name.toLowerCase().includes(query.toLowerCase()) || 
               user.username.toLowerCase().includes(query.toLowerCase()) ||
               user.bio.toLowerCase().includes(query.toLowerCase());
    });
}

// ===========================================
// CONTENT LOADING FUNCTIONS
// ===========================================

function loadTimelineContent() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear existing content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">Your Timeline</h2>';
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // User not logged in
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Please log in to view your timeline.
            </div>
            <div class="bg-white shadow rounded-lg p-6 text-center">
                <p class="mb-4">Please log in to see your personalized timeline</p>
                <button id="timeline-login-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Log In</button>
            </div>
        `;
        
        // Add login button handler
        document.getElementById('timeline-login-btn').addEventListener('click', function() {
            document.getElementById('login-modal').classList.remove('hidden');
        });
        
        return;
    }
    
    // User is logged in - display timeline
    mainContent.innerHTML += `
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Murmur form -->
            <div class="p-4 border-b">
                <form id="post-murmur-form" class="flex flex-col">
                    <textarea id="new-murmur-content" placeholder="What's happening?" class="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 border" rows="3" maxlength="280" required></textarea>
                    
                    <!-- Media Upload Section -->
                    <div class="mb-4 mt-2">
                        <div class="flex space-x-4">
                            <div>
                                <label for="image-upload" class="cursor-pointer flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 hover:bg-gray-200">
                                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="text-sm text-gray-600">Image</span>
                                </label>
                                <input type="file" id="image-upload" accept="image/*" class="hidden" />
                            </div>
                            <div>
                                <label for="video-upload" class="cursor-pointer flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 hover:bg-gray-200">
                                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    <span class="text-sm text-gray-600">Video</span>
                                </label>
                                <input type="file" id="video-upload" accept="video/*" class="hidden" />
                            </div>
                            <div>
                                <label for="audio-upload" class="cursor-pointer flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 hover:bg-gray-200">
                                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                    <span class="text-sm text-gray-600">Audio</span>
                                </label>
                                <input type="file" id="audio-upload" accept="audio/*" class="hidden" />
                            </div>
                        </div>
                        
                        <!-- Media preview area -->
                        <div id="media-preview-container" class="mt-4 hidden">
                            <div class="relative">
                                <div id="image-preview-container" class="hidden">
                                    <img id="image-preview" class="max-h-60 rounded-lg" alt="Preview" />
                                </div>
                                <div id="video-preview-container" class="hidden">
                                    <video id="video-preview" class="max-h-60 rounded-lg" controls></video>
                                </div>
                                <div id="audio-preview-container" class="hidden">
                                    <audio id="audio-preview" class="w-full" controls></audio>
                                </div>
                                <button id="remove-media-btn" type="button" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center mt-2">
                        <div class="text-sm text-gray-500">
                            <span id="new-post-char-count">0</span>/280
                        </div>
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Murmur</button>
                    </div>
                </form>
            </div>
            
            <div id="timeline-container" class="divide-y">
                <!-- Timeline murmurs will be added here -->
            </div>
        </div>
    `;
    
    // Add character counter
    const textarea = document.getElementById('new-murmur-content');
    const charCount = document.getElementById('new-post-char-count');
    
    textarea.addEventListener('input', function() {
        charCount.textContent = textarea.value.length;
        
        if (textarea.value.length > 280) {
            charCount.classList.add('text-red-500');
        } else {
            charCount.classList.remove('text-red-500');
        }
    });
    
    // Add form submission handler
    document.getElementById('post-murmur-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = textarea.value.trim();
        
        if (content) {
            // Add murmur to timeline
            const timelineContainer = document.getElementById('timeline-container');
            
            // Create a new murmur
            const murmur = {
                id: Date.now(), // Use timestamp as ID for demo
                content: content,
                author: currentUser,
                created_at: new Date().toISOString(),
                likes_count: 0
            };
            
            // Insert at the beginning
            const murmurElement = createMurmurElement(murmur);
            
            if (timelineContainer.firstChild) {
                timelineContainer.insertBefore(murmurElement, timelineContainer.firstChild);
            } else {
                timelineContainer.appendChild(murmurElement);
            }
            
            // Reset form
            textarea.value = '';
            charCount.textContent = '0';
            
            showMessage('success', 'Murmur posted successfully!');
        }
    });
    
    // Load demo timeline murmurs
    loadDemoMurmurs('timeline-container');
}

function loadExploreContent() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear existing content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">Explore Murmurs</h2>';
    
    // Add murmur container
    mainContent.innerHTML += `
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div id="explore-container" class="divide-y">
                <!-- Explore murmurs will be added here -->
            </div>
        </div>
    `;
    
    // Load demo murmurs
    loadDemoMurmurs('explore-container');
}

function loadUserProfile(userId) {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Get demo user data
    const user = getDemoUserById(userId);
    
    if (!user) {
        mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">User Profile</h2>';
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                User not found.
            </div>
        `;
        return;
    }
    
    // Clear existing content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">User Profile</h2>';
    
    // Generate avatar color
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = user.username.charCodeAt(0) % colors.length;
    const avatarColor = colors[colorIndex];
    
    // Create profile header
    const profileHeader = document.createElement('div');
    profileHeader.className = 'bg-white shadow rounded-lg p-6 mb-6';
    
    // Check if current user is viewing their own profile
    const currentUser = getCurrentUser();
    const isOwnProfile = currentUser && currentUser.id === user.id;
    
    // Determine if current user is following this user (demo)
    const isFollowing = false; // Demo value
    
    profileHeader.innerHTML = `
        <div class="flex flex-col md:flex-row items-center md:items-start">
            <div class="mb-4 md:mb-0 md:mr-6 ${avatarColor} w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="flex-grow text-center md:text-left">
                <h2 class="text-2xl font-bold">${user.name}</h2>
                <p class="text-gray-600 mb-2">@${user.username}</p>
                <p class="text-gray-800 mb-4">${user.bio || 'No bio provided'}</p>
                
                <div class="flex justify-center md:justify-start space-x-6 mb-4">
                    <div class="text-center">
                        <span class="font-bold">20</span>
                        <span class="text-gray-600">Murmurs</span>
                    </div>
                    <div class="text-center">
                        <span class="font-bold">15</span>
                        <span class="text-gray-600">Following</span>
                    </div>
                    <div class="text-center">
                        <span class="font-bold">10</span>
                        <span class="text-gray-600">Followers</span>
                    </div>
                </div>
                
                ${isOwnProfile ? 
                    `<button id="edit-profile-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>` : 
                    `<button id="follow-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${isFollowing ? 'hidden' : ''}">Follow</button>
                     <button id="unfollow-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded ${isFollowing ? '' : 'hidden'}">Unfollow</button>`
                }
            </div>
        </div>
    `;
    
    mainContent.appendChild(profileHeader);
    
    // Add murmur tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'bg-white shadow rounded-lg overflow-hidden';
    tabsContainer.innerHTML = `
        <div class="flex border-b">
            <button id="murmurs-tab" class="flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500">Murmurs</button>
            <button id="following-tab" class="flex-1 py-3 px-4 font-medium text-center text-gray-500">Following</button>
            <button id="followers-tab" class="flex-1 py-3 px-4 font-medium text-center text-gray-500">Followers</button>
        </div>
        <div id="profile-tab-content" class="divide-y">
            <!-- Tab content will be added here -->
        </div>
    `;
    
    mainContent.appendChild(tabsContainer);
    
    // Set up tab switching
    document.getElementById('murmurs-tab').addEventListener('click', function() {
        setActiveProfileTab('murmurs');
        loadUserMurmurs(userId);
    });
    
    document.getElementById('following-tab').addEventListener('click', function() {
        setActiveProfileTab('following');
        loadUserFollowing(userId);
    });
    
    document.getElementById('followers-tab').addEventListener('click', function() {
        setActiveProfileTab('followers');
        loadUserFollowers(userId);
    });
    
    // Load user murmurs by default
    loadUserMurmurs(userId);
    
    // Add follow/unfollow button handlers if not own profile
    if (!isOwnProfile && currentUser) {
        const followBtn = document.getElementById('follow-btn');
        const unfollowBtn = document.getElementById('unfollow-btn');
        
        if (followBtn) {
            followBtn.addEventListener('click', function() {
                followBtn.classList.add('hidden');
                unfollowBtn.classList.remove('hidden');
                showMessage('success', `You are now following ${user.name}`);
            });
        }
        
        if (unfollowBtn) {
            unfollowBtn.addEventListener('click', function() {
                unfollowBtn.classList.add('hidden');
                followBtn.classList.remove('hidden');
                showMessage('success', `You have unfollowed ${user.name}`);
            });
        }
    }
    
    // Add edit profile handler if own profile
    if (isOwnProfile) {
        const editProfileBtn = document.getElementById('edit-profile-btn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                // Demo functionality - just show a message
                showMessage('info', 'Edit profile functionality would open here');
            });
        }
    }
}

function loadUserMurmurs(userId) {
    setActiveProfileTab('murmurs');
    
    const tabContent = document.getElementById('profile-tab-content');
    
    // Load demo murmurs for this user
    tabContent.innerHTML = '';
    
    // Get demo murmurs
    const userMurmurs = getDemoMurmursByUserId(userId);
    
    if (userMurmurs.length === 0) {
        tabContent.innerHTML = `
            <div class="p-6 text-center text-gray-500">
                No murmurs yet.
            </div>
        `;
        return;
    }
    
    // Add murmurs
    userMurmurs.forEach(function(murmur) {
        const murmurElement = createMurmurElement(murmur);
        tabContent.appendChild(murmurElement);
    });
}

function loadUserFollowing(userId) {
    setActiveProfileTab('following');
    
    const tabContent = document.getElementById('profile-tab-content');
    
    // Load demo following for this user
    tabContent.innerHTML = `
        <div class="p-6 text-center text-gray-500">
            This user is not following anyone yet.
        </div>
    `;
}

function loadUserFollowers(userId) {
    setActiveProfileTab('followers');
    
    const tabContent = document.getElementById('profile-tab-content');
    
    // Load demo followers for this user
    tabContent.innerHTML = `
        <div class="p-6 text-center text-gray-500">
            This user has no followers yet.
        </div>
    `;
}

function setActiveProfileTab(tabName) {
    const murmursTab = document.getElementById('murmurs-tab');
    const followingTab = document.getElementById('following-tab');
    const followersTab = document.getElementById('followers-tab');
    
    // Reset all tabs
    murmursTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-500';
    followingTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-500';
    followersTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-500';
    
    // Set active tab
    if (tabName === 'murmurs') {
        murmursTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    } else if (tabName === 'following') {
        followingTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    } else if (tabName === 'followers') {
        followersTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    }
}

// ===========================================
// MEDIA UPLOAD FUNCTIONALITY
// ===========================================

function setupMediaUpload() {
    // This function will be called when the timeline content is loaded
    // and the media upload elements are present in the DOM
    setupMediaPreviewHandlers();
}

function setupMediaPreviewHandlers() {
    // Look for media file inputs on the page
    // These may be added dynamically when the timeline loads
    const imageUpload = document.getElementById('image-upload');
    const videoUpload = document.getElementById('video-upload');
    const audioUpload = document.getElementById('audio-upload');
    const mediaPreviewContainer = document.getElementById('media-preview-container');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const audioPreviewContainer = document.getElementById('audio-preview-container');
    const removeMediaBtn = document.getElementById('remove-media-btn');
    
    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('image-preview');
                    
                    // Hide other media previews
                    if (videoPreviewContainer) videoPreviewContainer.classList.add('hidden');
                    if (audioPreviewContainer) audioPreviewContainer.classList.add('hidden');
                    
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
        videoUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const videoPreview = document.getElementById('video-preview');
                    
                    // Hide other media previews
                    if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
                    if (audioPreviewContainer) audioPreviewContainer.classList.add('hidden');
                    
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
        audioUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const audioPreview = document.getElementById('audio-preview');
                    
                    // Hide other media previews
                    if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
                    if (videoPreviewContainer) videoPreviewContainer.classList.add('hidden');
                    
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
    
    if (removeMediaBtn) {
        removeMediaBtn.addEventListener('click', function() {
            // Reset file inputs
            if (imageUpload) imageUpload.value = '';
            if (videoUpload) videoUpload.value = '';
            if (audioUpload) audioUpload.value = '';
            
            // Hide preview containers
            if (mediaPreviewContainer) mediaPreviewContainer.classList.add('hidden');
            if (imagePreviewContainer) imagePreviewContainer.classList.add('hidden');
            if (videoPreviewContainer) videoPreviewContainer.classList.add('hidden');
            if (audioPreviewContainer) audioPreviewContainer.classList.add('hidden');
            
            // Clear media data
            currentMedia = null;
        });
    }
}

// ===========================================
// MURMUR FORM
// ===========================================

function setupMurmurForm() {
    // This is for the main murmur form that may exist already in the HTML
    const murmurForm = document.getElementById('murmur-form');
    
    if (murmurForm) {
        // Character counter for the murmur form
        const contentField = document.getElementById('murmur-content');
        const charCount = document.getElementById('char-count');
        
        if (contentField && charCount) {
            contentField.addEventListener('input', function() {
                charCount.textContent = contentField.value.length;
                
                if (contentField.value.length > 280) {
                    charCount.classList.add('text-red-500');
                } else {
                    charCount.classList.remove('text-red-500');
                }
            });
        }
        
        // Form submission
        murmurForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showMessage('error', 'Please log in to post a murmur');
                return;
            }
            
            const content = contentField.value.trim();
            
            if (!content && !currentMedia) {
                showMessage('error', 'Please enter some content or add media');
                return;
            }
            
            if (content.length > 280) {
                showMessage('error', 'Content cannot exceed 280 characters');
                return;
            }
            
            // Reset form
            murmurForm.reset();
            charCount.textContent = '0';
            
            // Clear media previews
            const mediaPreviewContainer = document.getElementById('media-preview-container');
            if (mediaPreviewContainer) mediaPreviewContainer.classList.add('hidden');
            
            currentMedia = null;
            
            // Show success message
            showMessage('success', 'Murmur posted successfully!');
            
            // Reload timeline
            loadTimelineContent();
        });
    }
    
    // Setup for the New Post form that's added dynamically in the timeline
    // We need to monitor for this form being added to the DOM
    document.addEventListener('DOMNodeInserted', function(e) {
        const postForm = document.getElementById('post-murmur-form');
        if (postForm && !postForm.hasAttribute('data-initialized')) {
            // Mark the form as initialized to prevent duplicate event handlers
            postForm.setAttribute('data-initialized', 'true');
            
            // Setup character counter
            const newPostContent = document.getElementById('new-murmur-content');
            const newPostCharCount = document.getElementById('new-post-char-count');
            
            if (newPostContent && newPostCharCount) {
                newPostContent.addEventListener('input', function() {
                    newPostCharCount.textContent = newPostContent.value.length;
                    
                    if (newPostContent.value.length > 280) {
                        newPostCharCount.classList.add('text-red-500');
                    } else {
                        newPostCharCount.classList.remove('text-red-500');
                    }
                });
            }
            
            // Setup form submission
            postForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    showMessage('error', 'Please log in to post a murmur');
                    return;
                }
                
                const content = newPostContent.value.trim();
                
                if (!content && !currentMedia) {
                    showMessage('error', 'Please enter some content or add media');
                    return;
                }
                
                if (content.length > 280) {
                    showMessage('error', 'Content cannot exceed 280 characters');
                    return;
                }
                
                // Create a new murmur with media if available
                const murmur = {
                    id: Date.now(),
                    content: content,
                    author: currentUser,
                    media_type: currentMedia ? currentMedia.type : null,
                    media_url: currentMedia ? currentMedia.data : null,
                    created_at: new Date().toISOString(),
                    likes_count: 0
                };
                
                // Add to timeline
                const timelineContainer = document.getElementById('timeline-container');
                const murmurElement = createMurmurElement(murmur);
                
                if (timelineContainer.firstChild) {
                    timelineContainer.insertBefore(murmurElement, timelineContainer.firstChild);
                } else {
                    timelineContainer.appendChild(murmurElement);
                }
                
                // Reset form
                postForm.reset();
                newPostCharCount.textContent = '0';
                
                // Clear media preview
                const mediaPreviewContainer = document.getElementById('media-preview-container');
                if (mediaPreviewContainer) mediaPreviewContainer.classList.add('hidden');
                currentMedia = null;
                
                // Show success message
                showMessage('success', 'Murmur posted successfully!');
            });
            
            // Setup media upload handlers for this new form
            setupMediaPreviewHandlers();
        }
    });
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function loadDemoMurmurs(containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Get demo murmurs
    const murmurs = getDemoMurmurs();
    
    if (murmurs.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-gray-500">
                No murmurs available.
            </div>
        `;
        return;
    }
    
    // Add murmurs to container
    murmurs.forEach(function(murmur) {
        const murmurElement = createMurmurElement(murmur);
        container.appendChild(murmurElement);
    });
}

function createMurmurElement(murmur) {
    const element = document.createElement('div');
    element.className = 'p-4 hover:bg-gray-50';
    element.dataset.murmurId = murmur.id;
    
    const user = murmur.author;
    
    // Generate avatar color
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = user.username.charCodeAt(0) % colors.length;
    const avatarColor = colors[colorIndex];
    
    // Format date
    const date = new Date(murmur.created_at);
    const formattedDate = date.toLocaleString();
    
    // Determine if current user has liked this murmur
    const currentUser = getCurrentUser();
    const isLiked = false; // Demo value
    
    // Determine if current user can delete this murmur
    const canDelete = currentUser && currentUser.id === user.id;
    
    element.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0 mr-3">
                <div class="w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white text-lg font-bold">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="flex-1">
                <div class="flex items-center mb-1">
                    <span class="font-bold cursor-pointer hover:underline" onclick="loadUserProfile(${user.id})">${user.name}</span>
                    <span class="text-gray-500 text-sm ml-2 cursor-pointer hover:underline" onclick="loadUserProfile(${user.id})">@${user.username}</span>
                    <span class="text-gray-400 text-sm ml-2" title="${formattedDate}">• ${formattedDate}</span>
                </div>
                <p class="mb-2 whitespace-pre-wrap">${murmur.content}</p>
                <div class="flex text-gray-500">
                    <button class="like-button flex items-center hover:text-red-500 ${isLiked ? 'text-red-500' : ''}" data-murmur-id="${murmur.id}">
                        <svg class="w-5 h-5 mr-1" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        <span class="like-count">${murmur.likes_count}</span>
                    </button>
                    ${canDelete ? `
                        <button class="delete-button ml-4 text-red-500 hover:text-red-700 flex items-center" data-murmur-id="${murmur.id}">
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
    
    // Add like button handler
    const likeButton = element.querySelector('.like-button');
    likeButton.addEventListener('click', function() {
        if (!currentUser) {
            showMessage('error', 'Please log in to like murmurs');
            return;
        }
        
        const isCurrentlyLiked = likeButton.classList.contains('text-red-500');
        const likeCount = likeButton.querySelector('.like-count');
        
        if (isCurrentlyLiked) {
            // Unlike
            likeButton.classList.remove('text-red-500');
            likeButton.querySelector('svg').setAttribute('fill', 'none');
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        } else {
            // Like
            likeButton.classList.add('text-red-500');
            likeButton.querySelector('svg').setAttribute('fill', 'currentColor');
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        }
    });
    
    // Add delete button handler
    const deleteButton = element.querySelector('.delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this murmur?')) {
                element.remove();
                showMessage('success', 'Murmur deleted successfully');
            }
        });
    }
    
    return element;
}

function showMessage(type, message) {
    const flashContainer = document.getElementById('flash-container');
    
    if (!flashContainer) return;
    
    const messageElement = document.createElement('div');
    
    if (type === 'success') {
        messageElement.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
    } else if (type === 'error') {
        messageElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    } else if (type === 'info') {
        messageElement.className = 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4';
    }
    
    messageElement.innerHTML = `
        <span class="block sm:inline">${message}</span>
        <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg class="fill-current h-6 w-6 text-gray-500 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onclick="this.parentElement.parentElement.remove()">
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
        </span>
    `;
    
    flashContainer.appendChild(messageElement);
    
    // Auto-remove message after 5 seconds
    setTimeout(function() {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

// ===========================================
// DEMO DATA FUNCTIONS
// ===========================================

function getDemoMurmurs() {
    // Hardcoded demo murmurs
    return [
        {
            id: 1,
            content: "Just deployed my new website! Check it out at example.com #webdev #coding",
            author: getDemoUserById(1),
            created_at: "2025-05-19T10:30:00Z",
            likes_count: 15
        },
        {
            id: 2,
            content: "Learning about AI and machine learning today. Fascinating stuff!",
            author: getDemoUserById(1),
            created_at: "2025-05-18T16:45:00Z",
            likes_count: 8
        },
        {
            id: 3,
            content: "Working on a new marketing campaign. So excited to share the results soon!",
            author: getDemoUserById(2),
            created_at: "2025-05-19T08:12:00Z",
            likes_count: 21
        },
        {
            id: 4,
            content: "Just discovered this amazing coffee shop downtown. Their espresso is unbelievable!",
            author: getDemoUserById(2),
            created_at: "2025-05-17T14:27:00Z",
            likes_count: 34
        },
        {
            id: 5,
            content: "Visiting Paris next month! Any recommendations for places to visit?",
            author: getDemoUserById(3),
            created_at: "2025-05-19T11:05:00Z",
            likes_count: 42
        },
        {
            id: 6,
            content: "Just got a new camera for my travel photography. Can't wait to try it out!",
            author: getDemoUserById(3),
            created_at: "2025-05-16T09:33:00Z",
            likes_count: 27
        },
        {
            id: 7,
            content: "Working on a new painting series inspired by urban landscapes.",
            author: getDemoUserById(4),
            created_at: "2025-05-19T12:47:00Z",
            likes_count: 18
        },
        {
            id: 8,
            content: "Just finished my latest mix! Check it out on SoundCloud. #music #DJ",
            author: getDemoUserById(5),
            created_at: "2025-05-18T22:15:00Z",
            likes_count: 31
        }
    ];
}

function getDemoMurmursByUserId(userId) {
    return getDemoMurmurs().filter(function(murmur) {
        return murmur.author.id === parseInt(userId);
    });
}

function getDemoUserById(userId) {
    const users = [
        {
            id: 1,
            name: "John Doe",
            username: "johndoe",
            bio: "Software engineer and tech enthusiast"
        },
        {
            id: 2,
            name: "Jane Smith",
            username: "janesmith",
            bio: "Digital marketer and coffee lover"
        },
        {
            id: 3,
            name: "Bob Johnson",
            username: "bobjohnson",
            bio: "Travel blogger and photographer"
        },
        {
            id: 4,
            name: "Alice Williams",
            username: "alicewilliams",
            bio: "Artist and designer"
        },
        {
            id: 5,
            name: "Charlie Brown",
            username: "charliebrown",
            bio: "Music producer and DJ"
        }
    ];
    
    return users.find(function(user) {
        return user.id === parseInt(userId);
    });
}

// Make global functions available
window.loadUserProfile = loadUserProfile;