// App.js - Main functionality for Murmur application

// Global state
let currentPage = 1;
const PER_PAGE = 10;
// Store currently uploaded media (already defined in functions.js)

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners
    setupNavigation();
    setupSearchFunctionality();
    setupMediaPreview();
    setupMurmurForm();
    setupLoginLogout();
    
    // Load initial data
    if (window.location.hash) {
        handleRouteChange();
    } else {
        loadAllMurmurs();
    }
    
    // Update UI based on login status
    updateAuthUI();
});

// Setup navigation
function setupNavigation() {
    // Home button
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadTimeline();
        });
    }
    
    // Explore button
    const exploreBtn = document.getElementById('explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadAllMurmurs();
        });
    }
    
    // Handle route changes
    window.addEventListener('hashchange', handleRouteChange);
}

// Handle route changes
function handleRouteChange() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#/users/')) {
        const userId = hash.replace('#/users/', '');
        loadUserProfile(userId);
    } else if (hash.startsWith('#/murmurs/')) {
        const murmurId = hash.replace('#/murmurs/', '');
        loadMurmurDetail(murmurId);
    } else if (hash === '#/explore') {
        loadAllMurmurs();
    } else {
        loadTimeline();
    }
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput && searchResults) {
        let searchTimeout;
        
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            
            if (searchInput.value.trim().length < 2) {
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                const users = await searchUsers(searchInput.value.trim());
                
                if (users.length === 0) {
                    searchResults.innerHTML = '<div class="p-4 text-center text-gray-500">No users found</div>';
                } else {
                    searchResults.innerHTML = '';
                    
                    users.forEach(user => {
                        const userElement = createUserListItem(user);
                        searchResults.appendChild(userElement);
                    });
                }
                
                searchResults.classList.remove('hidden');
            }, 300);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
}

// Setup murmur form
function setupMurmurForm() {
    const murmurForm = document.getElementById('murmur-form');
    
    if (murmurForm) {
        murmurForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const murmurContent = document.getElementById('murmur-content').value.trim();
            
            if (!murmurContent && !currentMedia) {
                showFlashMessage('error', 'Please enter some content or add media');
                return;
            }
            
            if (murmurContent.length > 280) {
                showFlashMessage('error', 'Content cannot exceed 280 characters');
                return;
            }
            
            // Prepare media data
            let mediaType = null;
            let mediaData = null;
            
            if (currentMedia) {
                mediaType = currentMedia.type;
                mediaData = currentMedia.data;
            }
            
            // Post murmur
            const murmur = await postNewMurmur(murmurContent, mediaType, mediaData);
            
            if (murmur) {
                // Reset form
                murmurForm.reset();
                document.getElementById('char-count').textContent = '0';
                
                // Clear media preview
                const mediaPreviewContainer = document.getElementById('media-preview-container');
                if (mediaPreviewContainer) {
                    mediaPreviewContainer.classList.add('hidden');
                }
                
                currentMedia = null;
                
                // Show success message
                showFlashMessage('success', 'Murmur posted successfully!');
                
                // Reload timeline or murmurs
                if (window.location.hash === '#/explore') {
                    loadAllMurmurs();
                } else {
                    loadTimeline();
                }
            }
        });
    }
}

// Load timeline
async function loadTimeline() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear current content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">Your Timeline</h2>';
    
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    
    if (!currentUser) {
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Failed to load timeline. Please log in to view your timeline.
            </div>
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <p class="mb-4">Please log in to see your personalized timeline</p>
                <button id="timeline-login-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Log In</button>
            </div>
        `;
        
        // Add login button handler
        const loginBtn = document.getElementById('timeline-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                document.getElementById('login-modal').classList.remove('hidden');
            });
        }
        
        return;
    }
    
    // Show loading state
    mainContent.innerHTML += `
        <div id="timeline-loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading your timeline...</p>
        </div>
    `;
    
    try {
        const result = await getUserTimeline(currentUser.id, currentPage);
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById('timeline-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (result.murmurs.length === 0) {
            mainContent.innerHTML += `
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-gray-500">No murmurs yet! Follow other users or post something yourself.</p>
                </div>
            `;
        } else {
            // Create container for murmurs
            const murmursContainer = document.createElement('div');
            murmursContainer.className = 'bg-white rounded-lg shadow overflow-hidden';
            
            // Add each murmur
            result.murmurs.forEach(murmur => {
                const murmurCard = createMurmurCard(murmur);
                murmursContainer.appendChild(murmurCard);
            });
            
            // Add pagination if needed
            if (result.totalPages > 1) {
                const pagination = createPagination(result.page, result.totalPages, 'timeline');
                
                // Add event listeners to pagination buttons
                const prevButton = pagination.querySelector('button[data-page]');
                const nextButton = pagination.querySelectorAll('button[data-page]')[1];
                
                if (prevButton && prevButton.dataset.page) {
                    prevButton.addEventListener('click', () => {
                        currentPage = parseInt(prevButton.dataset.page);
                        loadTimeline();
                    });
                }
                
                if (nextButton && nextButton.dataset.page) {
                    nextButton.addEventListener('click', () => {
                        currentPage = parseInt(nextButton.dataset.page);
                        loadTimeline();
                    });
                }
                
                murmursContainer.appendChild(pagination);
            }
            
            mainContent.appendChild(murmursContainer);
        }
    } catch (error) {
        console.error('Error loading timeline:', error);
        
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Failed to load timeline. Please try again later.
            </div>
        `;
    }
}

// Load all murmurs (explore)
async function loadAllMurmurs() {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear current content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">Explore Murmurs</h2>';
    
    // Show loading state
    mainContent.innerHTML += `
        <div id="murmurs-loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading murmurs...</p>
        </div>
    `;
    
    try {
        const result = await getAllMurmurs(currentPage);
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById('murmurs-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (result.murmurs.length === 0) {
            mainContent.innerHTML += `
                <div class="bg-white rounded-lg shadow p-6 text-center">
                    <p class="text-gray-500">No murmurs yet!</p>
                </div>
            `;
        } else {
            // Create container for murmurs
            const murmursContainer = document.createElement('div');
            murmursContainer.className = 'bg-white rounded-lg shadow overflow-hidden';
            
            // Add each murmur
            result.murmurs.forEach(murmur => {
                const murmurCard = createMurmurCard(murmur);
                murmursContainer.appendChild(murmurCard);
            });
            
            // Add pagination if needed
            if (result.totalPages > 1) {
                const pagination = createPagination(result.page, result.totalPages, 'explore');
                
                // Add event listeners to pagination buttons
                const prevButton = pagination.querySelector('button[data-page]');
                const nextButton = pagination.querySelectorAll('button[data-page]')[1];
                
                if (prevButton && prevButton.dataset.page) {
                    prevButton.addEventListener('click', () => {
                        currentPage = parseInt(prevButton.dataset.page);
                        loadAllMurmurs();
                    });
                }
                
                if (nextButton && nextButton.dataset.page) {
                    nextButton.addEventListener('click', () => {
                        currentPage = parseInt(nextButton.dataset.page);
                        loadAllMurmurs();
                    });
                }
                
                murmursContainer.appendChild(pagination);
            }
            
            mainContent.appendChild(murmursContainer);
        }
    } catch (error) {
        console.error('Error loading murmurs:', error);
        
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Failed to load murmurs. Please try again later.
            </div>
        `;
    }
}

// Load user profile
async function loadUserProfile(userId) {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear current content
    mainContent.innerHTML = '';
    
    // Show loading state
    mainContent.innerHTML = `
        <div id="profile-loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading user profile...</p>
        </div>
    `;
    
    try {
        const user = await getUserProfile(userId);
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById('profile-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (!user) {
            mainContent.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    User not found.
                </div>
            `;
            return;
        }
        
        // Get current user
        const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
        const isCurrentUser = currentUser && currentUser.id === user.id;
        
        // Create profile header
        const profileHeader = document.createElement('div');
        profileHeader.className = 'bg-white rounded-lg shadow p-6 mb-6';
        
        // Create avatar
        const avatarSize = 'xlarge';
        const avatar = createUserAvatar(user, avatarSize);
        
        // Determine if following
        let isFollowing = false;
        if (currentUser && !isCurrentUser) {
            const following = await getFollowing(currentUser.id);
            isFollowing = following.following.some(followUser => followUser.id === user.id);
        }
        
        profileHeader.innerHTML = `
            <div class="flex flex-col md:flex-row items-center md:items-start">
                <div class="avatar-container mb-4 md:mb-0 md:mr-6"></div>
                <div class="flex-grow text-center md:text-left">
                    <h2 class="text-2xl font-bold">${user.name}</h2>
                    <p class="text-gray-600 mb-2">@${user.username}</p>
                    <p class="text-gray-800 mb-4">${user.bio || 'No bio provided'}</p>
                    
                    <div class="flex justify-center md:justify-start space-x-6 mb-4">
                        <div class="text-center">
                            <span class="font-bold">${user.murmurs_count}</span>
                            <span class="text-gray-600">Murmurs</span>
                        </div>
                        <div class="text-center">
                            <span class="font-bold">${user.following_count}</span>
                            <span class="text-gray-600">Following</span>
                        </div>
                        <div class="text-center">
                            <span class="font-bold">${user.followers_count}</span>
                            <span class="text-gray-600">Followers</span>
                        </div>
                    </div>
                    
                    ${!currentUser ? `
                        <button id="profile-login-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Log in to interact</button>
                    ` : isCurrentUser ? `
                        <button id="edit-profile-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Edit Profile</button>
                    ` : `
                        <button id="follow-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded ${isFollowing ? 'hidden' : ''}">Follow</button>
                        <button id="unfollow-btn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded ${isFollowing ? '' : 'hidden'}">Unfollow</button>
                    `}
                </div>
            </div>
        `;
        
        // Add avatar to container
        const avatarContainer = profileHeader.querySelector('.avatar-container');
        avatarContainer.appendChild(avatar);
        
        mainContent.appendChild(profileHeader);
        
        // Add tabs for Murmurs, Following, Followers
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'bg-white rounded-lg shadow overflow-hidden mb-6';
        tabsContainer.innerHTML = `
            <div class="flex border-b">
                <button id="murmurs-tab" class="flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500">Murmurs</button>
                <button id="following-tab" class="flex-1 py-3 px-4 font-medium text-center text-gray-600 hover:bg-gray-50">Following</button>
                <button id="followers-tab" class="flex-1 py-3 px-4 font-medium text-center text-gray-600 hover:bg-gray-50">Followers</button>
            </div>
            <div id="tab-content" class="min-h-[200px]"></div>
        `;
        
        mainContent.appendChild(tabsContainer);
        
        // Load murmurs by default
        loadUserMurmursTab(userId);
        
        // Add tab event listeners
        document.getElementById('murmurs-tab').addEventListener('click', () => {
            setActiveTab('murmurs');
            loadUserMurmursTab(userId);
        });
        
        document.getElementById('following-tab').addEventListener('click', () => {
            setActiveTab('following');
            loadUserFollowingTab(userId);
        });
        
        document.getElementById('followers-tab').addEventListener('click', () => {
            setActiveTab('followers');
            loadUserFollowersTab(userId);
        });
        
        // Add button event listeners
        
        // Login button (if not logged in)
        const loginBtn = document.getElementById('profile-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                document.getElementById('login-modal').classList.remove('hidden');
            });
        }
        
        // Edit profile button (if current user)
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                // Open edit profile modal
                // This would be implemented in a real app
                alert('Edit profile functionality would open here');
            });
        }
        
        // Follow button
        const followBtn = document.getElementById('follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', async () => {
                const success = await toggleFollow(userId, false);
                
                if (success) {
                    followBtn.classList.add('hidden');
                    document.getElementById('unfollow-btn').classList.remove('hidden');
                    
                    // Update follower count
                    const followerCountEl = profileHeader.querySelector('.flex.space-x-6 div:nth-child(3) .font-bold');
                    if (followerCountEl) {
                        const currentCount = parseInt(followerCountEl.textContent);
                        followerCountEl.textContent = currentCount + 1;
                    }
                    
                    showFlashMessage('success', `You are now following ${user.name}`);
                }
            });
        }
        
        // Unfollow button
        const unfollowBtn = document.getElementById('unfollow-btn');
        if (unfollowBtn) {
            unfollowBtn.addEventListener('click', async () => {
                const success = await toggleFollow(userId, true);
                
                if (success) {
                    unfollowBtn.classList.add('hidden');
                    document.getElementById('follow-btn').classList.remove('hidden');
                    
                    // Update follower count
                    const followerCountEl = profileHeader.querySelector('.flex.space-x-6 div:nth-child(3) .font-bold');
                    if (followerCountEl) {
                        const currentCount = parseInt(followerCountEl.textContent);
                        followerCountEl.textContent = Math.max(0, currentCount - 1);
                    }
                    
                    showFlashMessage('success', `You have unfollowed ${user.name}`);
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        
        mainContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Failed to load user profile. Please try again later.
            </div>
        `;
    }
}

// Load user murmurs tab
async function loadUserMurmursTab(userId) {
    const tabContent = document.getElementById('tab-content');
    
    if (!tabContent) return;
    
    // Show loading state
    tabContent.innerHTML = `
        <div class="text-center py-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading murmurs...</p>
        </div>
    `;
    
    try {
        const result = await getUserMurmurs(userId);
        
        if (result.murmurs.length === 0) {
            tabContent.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    No murmurs yet
                </div>
            `;
        } else {
            // Clear loading state
            tabContent.innerHTML = '';
            
            // Add each murmur
            result.murmurs.forEach(murmur => {
                const murmurCard = createMurmurCard(murmur);
                tabContent.appendChild(murmurCard);
            });
            
            // Add pagination if needed
            if (result.totalPages > 1) {
                const pagination = createPagination(result.page, result.totalPages, `user-murmurs-${userId}`);
                
                // Add event listeners
                const prevButton = pagination.querySelector('button[data-page]');
                const nextButton = pagination.querySelectorAll('button[data-page]')[1];
                
                if (prevButton && prevButton.dataset.page) {
                    prevButton.addEventListener('click', () => {
                        loadUserMurmursTab(userId, parseInt(prevButton.dataset.page));
                    });
                }
                
                if (nextButton && nextButton.dataset.page) {
                    nextButton.addEventListener('click', () => {
                        loadUserMurmursTab(userId, parseInt(nextButton.dataset.page));
                    });
                }
                
                tabContent.appendChild(pagination);
            }
        }
    } catch (error) {
        console.error('Error loading user murmurs:', error);
        
        tabContent.innerHTML = `
            <div class="p-6 text-center text-red-500">
                Failed to load murmurs. Please try again later.
            </div>
        `;
    }
}

// Load user following tab
async function loadUserFollowingTab(userId) {
    const tabContent = document.getElementById('tab-content');
    
    if (!tabContent) return;
    
    // Show loading state
    tabContent.innerHTML = `
        <div class="text-center py-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading following...</p>
        </div>
    `;
    
    try {
        const result = await getFollowing(userId);
        
        if (result.following.length === 0) {
            tabContent.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    Not following anyone yet
                </div>
            `;
        } else {
            // Clear loading state
            tabContent.innerHTML = '';
            
            // Add each user
            result.following.forEach(user => {
                const userCard = createUserListItem(user);
                tabContent.appendChild(userCard);
            });
            
            // Add pagination if needed
            if (result.totalPages > 1) {
                const pagination = createPagination(result.page, result.totalPages, `user-following-${userId}`);
                
                // Add event listeners
                const prevButton = pagination.querySelector('button[data-page]');
                const nextButton = pagination.querySelectorAll('button[data-page]')[1];
                
                if (prevButton && prevButton.dataset.page) {
                    prevButton.addEventListener('click', () => {
                        loadUserFollowingTab(userId, parseInt(prevButton.dataset.page));
                    });
                }
                
                if (nextButton && nextButton.dataset.page) {
                    nextButton.addEventListener('click', () => {
                        loadUserFollowingTab(userId, parseInt(nextButton.dataset.page));
                    });
                }
                
                tabContent.appendChild(pagination);
            }
        }
    } catch (error) {
        console.error('Error loading following:', error);
        
        tabContent.innerHTML = `
            <div class="p-6 text-center text-red-500">
                Failed to load following. Please try again later.
            </div>
        `;
    }
}

// Load user followers tab
async function loadUserFollowersTab(userId) {
    const tabContent = document.getElementById('tab-content');
    
    if (!tabContent) return;
    
    // Show loading state
    tabContent.innerHTML = `
        <div class="text-center py-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading followers...</p>
        </div>
    `;
    
    try {
        const result = await getFollowers(userId);
        
        if (result.followers.length === 0) {
            tabContent.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    No followers yet
                </div>
            `;
        } else {
            // Clear loading state
            tabContent.innerHTML = '';
            
            // Add each user
            result.followers.forEach(user => {
                const userCard = createUserListItem(user);
                tabContent.appendChild(userCard);
            });
            
            // Add pagination if needed
            if (result.totalPages > 1) {
                const pagination = createPagination(result.page, result.totalPages, `user-followers-${userId}`);
                
                // Add event listeners
                const prevButton = pagination.querySelector('button[data-page]');
                const nextButton = pagination.querySelectorAll('button[data-page]')[1];
                
                if (prevButton && prevButton.dataset.page) {
                    prevButton.addEventListener('click', () => {
                        loadUserFollowersTab(userId, parseInt(prevButton.dataset.page));
                    });
                }
                
                if (nextButton && nextButton.dataset.page) {
                    nextButton.addEventListener('click', () => {
                        loadUserFollowersTab(userId, parseInt(nextButton.dataset.page));
                    });
                }
                
                tabContent.appendChild(pagination);
            }
        }
    } catch (error) {
        console.error('Error loading followers:', error);
        
        tabContent.innerHTML = `
            <div class="p-6 text-center text-red-500">
                Failed to load followers. Please try again later.
            </div>
        `;
    }
}

// Load murmur detail
async function loadMurmurDetail(murmurId) {
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) return;
    
    // Clear current content
    mainContent.innerHTML = '<h2 class="text-2xl font-bold mb-4">Murmur Detail</h2>';
    
    // Show loading state
    mainContent.innerHTML += `
        <div id="murmur-loading" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading murmur...</p>
        </div>
    `;
    
    try {
        // In a real app, you'd make an API call to get the murmur by ID
        // For now, simulate with getAllMurmurs
        const allMurmurs = await getAllMurmurs();
        const murmur = allMurmurs.murmurs.find(m => m.id.toString() === murmurId.toString());
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById('murmur-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (!murmur) {
            mainContent.innerHTML += `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    Murmur not found.
                </div>
            `;
            return;
        }
        
        // Create container for murmur
        const murmurContainer = document.createElement('div');
        murmurContainer.className = 'bg-white rounded-lg shadow overflow-hidden';
        
        // Create murmur card with more details
        const murmurCard = createMurmurCard(murmur);
        murmurCard.classList.add('p-6'); // Add more padding for detail view
        
        murmurContainer.appendChild(murmurCard);
        mainContent.appendChild(murmurContainer);
        
        // Add back button
        const backButton = document.createElement('button');
        backButton.className = 'mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center';
        backButton.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
        `;
        backButton.addEventListener('click', () => {
            window.history.back();
        });
        
        mainContent.appendChild(backButton);
        
    } catch (error) {
        console.error('Error loading murmur detail:', error);
        
        mainContent.innerHTML += `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                Failed to load murmur. Please try again later.
            </div>
        `;
    }
}

// Helper: Set active tab
function setActiveTab(tabName) {
    const murmursTab = document.getElementById('murmurs-tab');
    const followingTab = document.getElementById('following-tab');
    const followersTab = document.getElementById('followers-tab');
    
    // Reset all tabs
    murmursTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-600 hover:bg-gray-50';
    followingTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-600 hover:bg-gray-50';
    followersTab.className = 'flex-1 py-3 px-4 font-medium text-center text-gray-600 hover:bg-gray-50';
    
    // Set active tab
    if (tabName === 'murmurs') {
        murmursTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    } else if (tabName === 'following') {
        followingTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    } else if (tabName === 'followers') {
        followersTab.className = 'flex-1 py-3 px-4 font-medium text-center border-b-2 border-blue-500 text-blue-500';
    }
}