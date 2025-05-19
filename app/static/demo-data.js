// Demo data for the Murmur application
// This file provides sample data for our frontend to display

// Sample users
const DEMO_USERS = [
    {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        bio: "Software engineer and tech enthusiast",
        profile_image: null,
        followers_count: 42,
        following_count: 38,
        murmurs_count: 127
    },
    {
        id: 2,
        name: "Jane Smith",
        username: "janesmith",
        email: "jane@example.com",
        bio: "Digital marketer and coffee lover",
        profile_image: null,
        followers_count: 156,
        following_count: 89,
        murmurs_count: 254
    },
    {
        id: 3,
        name: "Bob Johnson",
        username: "bobjohnson",
        email: "bob@example.com",
        bio: "Travel blogger and photographer",
        profile_image: null,
        followers_count: 352,
        following_count: 201,
        murmurs_count: 487
    },
    {
        id: 4,
        name: "Alice Williams",
        username: "alicewilliams",
        email: "alice@example.com",
        bio: "Artist and designer",
        profile_image: null,
        followers_count: 78,
        following_count: 45,
        murmurs_count: 62
    },
    {
        id: 5,
        name: "Charlie Brown",
        username: "charliebrown",
        email: "charlie@example.com",
        bio: "Music producer and DJ",
        profile_image: null,
        followers_count: 210,
        following_count: 132,
        murmurs_count: 105
    }
];

// Sample murmurs
const DEMO_MURMURS = [
    {
        id: 1,
        content: "Just deployed my new website! Check it out at example.com #webdev #coding",
        user_id: 1,
        author: DEMO_USERS[0],
        media_type: null,
        media_url: null,
        created_at: "2025-05-19T10:30:00Z",
        updated_at: "2025-05-19T10:30:00Z",
        likes_count: 15
    },
    {
        id: 2,
        content: "Learning about AI and machine learning today. Fascinating stuff!",
        user_id: 1,
        author: DEMO_USERS[0],
        media_type: null,
        media_url: null,
        created_at: "2025-05-18T16:45:00Z",
        updated_at: "2025-05-18T16:45:00Z",
        likes_count: 8
    },
    {
        id: 3,
        content: "Working on a new marketing campaign. So excited to share the results soon!",
        user_id: 2,
        author: DEMO_USERS[1],
        media_type: null,
        media_url: null,
        created_at: "2025-05-19T08:12:00Z",
        updated_at: "2025-05-19T08:12:00Z",
        likes_count: 21
    },
    {
        id: 4,
        content: "Just discovered this amazing coffee shop downtown. Their espresso is unbelievable!",
        user_id: 2,
        author: DEMO_USERS[1],
        media_type: null,
        media_url: null,
        created_at: "2025-05-17T14:27:00Z",
        updated_at: "2025-05-17T14:27:00Z",
        likes_count: 34
    },
    {
        id: 5,
        content: "Visiting Paris next month! Any recommendations for places to visit?",
        user_id: 3,
        author: DEMO_USERS[2],
        media_type: null,
        media_url: null,
        created_at: "2025-05-19T11:05:00Z",
        updated_at: "2025-05-19T11:05:00Z",
        likes_count: 42
    },
    {
        id: 6,
        content: "Just got a new camera for my travel photography. Can't wait to try it out!",
        user_id: 3,
        author: DEMO_USERS[2],
        media_type: null,
        media_url: null,
        created_at: "2025-05-16T09:33:00Z",
        updated_at: "2025-05-16T09:33:00Z",
        likes_count: 27
    },
    {
        id: 7,
        content: "Working on a new painting series inspired by urban landscapes.",
        user_id: 4,
        author: DEMO_USERS[3],
        media_type: null,
        media_url: null,
        created_at: "2025-05-19T12:47:00Z",
        updated_at: "2025-05-19T12:47:00Z",
        likes_count: 18
    },
    {
        id: 8,
        content: "Just finished my latest mix! Check it out on SoundCloud. #music #DJ",
        user_id: 5,
        author: DEMO_USERS[4],
        media_type: null,
        media_url: null,
        created_at: "2025-05-18T22:15:00Z",
        updated_at: "2025-05-18T22:15:00Z",
        likes_count: 31
    },
    {
        id: 9,
        content: "Had an amazing hike this weekend. The views were breathtaking!",
        user_id: 3,
        author: DEMO_USERS[2],
        media_type: null,
        media_url: null,
        created_at: "2025-05-15T18:20:00Z",
        updated_at: "2025-05-15T18:20:00Z",
        likes_count: 53
    },
    {
        id: 10,
        content: "Just finished reading an incredible book. Highly recommend it!",
        user_id: 1,
        author: DEMO_USERS[0],
        media_type: null,
        media_url: null,
        created_at: "2025-05-14T21:10:00Z",
        updated_at: "2025-05-14T21:10:00Z",
        likes_count: 12
    }
];

// Demo API functions that mimic real API calls using the demo data
const DemoAPI = {
    // Auth endpoints
    login: function(email, password) {
        // For demo purposes, we'll accept any email that exists in our demo users
        const user = DEMO_USERS.find(u => u.email === email);
        
        if (user && password === 'password') {
            return {
                success: true,
                user: user
            };
        }
        
        return {
            success: false,
            error: 'Invalid email or password'
        };
    },
    
    register: function(userData) {
        // Create a new user with the next ID
        const newId = DEMO_USERS.length + 1;
        
        const newUser = {
            id: newId,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            bio: userData.bio || `Hi, I'm ${userData.name}!`,
            profile_image: null,
            followers_count: 0,
            following_count: 0,
            murmurs_count: 0
        };
        
        // Add to demo users
        DEMO_USERS.push(newUser);
        
        return {
            success: true,
            user: newUser
        };
    },
    
    // User endpoints
    getUser: function(userId) {
        const user = DEMO_USERS.find(u => u.id === parseInt(userId));
        
        if (user) {
            return {
                success: true,
                user: user
            };
        }
        
        return {
            success: false,
            error: 'User not found'
        };
    },
    
    searchUsers: function(query) {
        const lowerQuery = query.toLowerCase();
        
        const users = DEMO_USERS.filter(u => 
            u.name.toLowerCase().includes(lowerQuery) || 
            u.username.toLowerCase().includes(lowerQuery) ||
            u.bio.toLowerCase().includes(lowerQuery)
        );
        
        return {
            success: true,
            users: users,
            total: users.length
        };
    },
    
    // Follow/unfollow (just update the counts for demo)
    followUser: function(userId, followerId) {
        const user = DEMO_USERS.find(u => u.id === parseInt(userId));
        const follower = DEMO_USERS.find(u => u.id === parseInt(followerId));
        
        if (user && follower) {
            user.followers_count++;
            follower.following_count++;
            
            return {
                success: true
            };
        }
        
        return {
            success: false,
            error: 'User not found'
        };
    },
    
    unfollowUser: function(userId, followerId) {
        const user = DEMO_USERS.find(u => u.id === parseInt(userId));
        const follower = DEMO_USERS.find(u => u.id === parseInt(followerId));
        
        if (user && follower) {
            user.followers_count = Math.max(0, user.followers_count - 1);
            follower.following_count = Math.max(0, follower.following_count - 1);
            
            return {
                success: true
            };
        }
        
        return {
            success: false,
            error: 'User not found'
        };
    },
    
    // Murmur endpoints
    getAllMurmurs: function(page = 1, perPage = 10) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        const murmurs = DEMO_MURMURS.slice(startIndex, endIndex);
        
        return {
            success: true,
            murmurs: murmurs,
            current_page: page,
            pages: Math.ceil(DEMO_MURMURS.length / perPage),
            total: DEMO_MURMURS.length
        };
    },
    
    getUserTimeline: function(userId, page = 1, perPage = 10) {
        // For the demo, we'll just return all murmurs as the timeline
        return this.getAllMurmurs(page, perPage);
    },
    
    getUserMurmurs: function(userId, page = 1, perPage = 10) {
        const userMurmurs = DEMO_MURMURS.filter(m => m.user_id === parseInt(userId));
        
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        const murmurs = userMurmurs.slice(startIndex, endIndex);
        
        return {
            success: true,
            murmurs: murmurs,
            current_page: page,
            pages: Math.ceil(userMurmurs.length / perPage),
            total: userMurmurs.length
        };
    },
    
    createMurmur: function(murmurData) {
        const newId = DEMO_MURMURS.length + 1;
        const user = DEMO_USERS.find(u => u.id === parseInt(murmurData.user_id));
        
        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }
        
        const newMurmur = {
            id: newId,
            content: murmurData.content,
            user_id: parseInt(murmurData.user_id),
            author: user,
            media_type: murmurData.media_type,
            media_url: murmurData.media_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes_count: 0
        };
        
        // Add to beginning of demo murmurs
        DEMO_MURMURS.unshift(newMurmur);
        
        // Update user murmur count
        user.murmurs_count++;
        
        return {
            success: true,
            murmur: newMurmur
        };
    },
    
    deleteMurmur: function(murmurId, userId) {
        const murmurIndex = DEMO_MURMURS.findIndex(m => m.id === parseInt(murmurId) && m.user_id === parseInt(userId));
        
        if (murmurIndex !== -1) {
            // Remove murmur
            const murmur = DEMO_MURMURS[murmurIndex];
            DEMO_MURMURS.splice(murmurIndex, 1);
            
            // Update user murmur count
            const user = DEMO_USERS.find(u => u.id === parseInt(userId));
            if (user) {
                user.murmurs_count = Math.max(0, user.murmurs_count - 1);
            }
            
            return {
                success: true
            };
        }
        
        return {
            success: false,
            error: 'Murmur not found or not authorized to delete'
        };
    },
    
    // Like/unlike
    likeMurmur: function(murmurId, userId) {
        const murmur = DEMO_MURMURS.find(m => m.id === parseInt(murmurId));
        
        if (murmur) {
            murmur.likes_count++;
            
            return {
                success: true,
                likes_count: murmur.likes_count
            };
        }
        
        return {
            success: false,
            error: 'Murmur not found'
        };
    },
    
    unlikeMurmur: function(murmurId, userId) {
        const murmur = DEMO_MURMURS.find(m => m.id === parseInt(murmurId));
        
        if (murmur) {
            murmur.likes_count = Math.max(0, murmur.likes_count - 1);
            
            return {
                success: true,
                likes_count: murmur.likes_count
            };
        }
        
        return {
            success: false,
            error: 'Murmur not found'
        };
    }
};