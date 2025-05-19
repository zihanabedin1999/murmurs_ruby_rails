// API client for Murmur API
const API_BASE_URL = '/api';

// Helper to handle API responses
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }
    return data;
}

// User Authentication
const AuthAPI = {
    // Register a new user
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    // Login a user
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return handleResponse(response);
    }
};

// User Profiles
const UserAPI = {
    // Get user by ID
    getUser: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        return handleResponse(response);
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/me/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    // Upload profile image
    uploadProfileImage: async (userId, imageFile) => {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('profile_image', imageFile);

        const response = await fetch(`${API_BASE_URL}/me/profile/upload-image`, {
            method: 'POST',
            body: formData
        });
        return handleResponse(response);
    },

    // Search users
    searchUsers: async (query, page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Get user's followers
    getFollowers: async (userId, page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/followers?page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Get users followed by this user
    getFollowing: async (userId, page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/following?page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Follow a user
    followUser: async (userId, followerId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ follower_id: followerId })
        });
        return handleResponse(response);
    },

    // Unfollow a user
    unfollowUser: async (userId, followerId) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ follower_id: followerId })
        });
        return handleResponse(response);
    }
};

// Murmurs
const MurmurAPI = {
    // Get timeline (murmurs from followed users)
    getTimeline: async (userId, page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/timeline?user_id=${userId}&page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Get all murmurs
    getAllMurmurs: async (page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/murmurs?page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Get a single murmur
    getMurmur: async (murmurId) => {
        const response = await fetch(`${API_BASE_URL}/murmurs/${murmurId}`);
        return handleResponse(response);
    },

    // Get murmurs by a specific user
    getUserMurmurs: async (userId, page = 1, perPage = 10) => {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/murmurs?page=${page}&per_page=${perPage}`);
        return handleResponse(response);
    },

    // Create a new murmur
    createMurmur: async (murmurData) => {
        const response = await fetch(`${API_BASE_URL}/me/murmurs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(murmurData)
        });
        return handleResponse(response);
    },

    // Delete a murmur
    deleteMurmur: async (murmurId, userId) => {
        const response = await fetch(`${API_BASE_URL}/me/murmurs/${murmurId}?user_id=${userId}`, {
            method: 'DELETE'
        });
        return handleResponse(response);
    },

    // Like a murmur
    likeMurmur: async (murmurId, userId) => {
        const response = await fetch(`${API_BASE_URL}/murmurs/${murmurId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        return handleResponse(response);
    },

    // Unlike a murmur
    unlikeMurmur: async (murmurId, userId) => {
        const response = await fetch(`${API_BASE_URL}/murmurs/${murmurId}/unlike`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        return handleResponse(response);
    }
};

// Export all API functions
window.MurmurAPI = {
    auth: AuthAPI,
    users: UserAPI,
    murmurs: MurmurAPI
};