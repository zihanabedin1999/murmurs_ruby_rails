// Proxy to forward API requests from the frontend to the backend server
// This helps solve CORS issues and allows our frontend to communicate with the backend

// The actual API server URL
const API_SERVER = "http://172.31.128.45:8000";

// Map of API endpoints for the demo app
// This allows us to simulate the API while building the frontend
const DEMO_API_ENDPOINTS = {
    // Auth endpoints
    "/api/auth/login": {
        method: "POST",
        response: (data) => {
            // Simplified login for demo
            if (data.email === "demo@example.com" && data.password === "password") {
                return {
                    message: "Login successful",
                    user: {
                        id: 1,
                        name: "Demo User",
                        username: "demouser",
                        email: "demo@example.com",
                        bio: "This is a demo user account",
                        profile_image: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                };
            } else {
                throw new Error("Invalid email or password");
            }
        }
    },
    
    "/api/auth/register": {
        method: "POST",
        response: (data) => {
            return {
                message: "User registered successfully",
                user: {
                    id: new Date().getTime(),
                    name: data.name,
                    username: data.username,
                    email: data.email,
                    bio: data.bio || `Hi, I'm ${data.name}!`,
                    profile_image: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            };
        }
    },
    
    // Murmur endpoints
    "/api/murmurs": {
        method: "GET",
        response: () => {
            return {
                murmurs: generateDemoMurmurs(10),
                current_page: 1,
                pages: 3,
                total_items: 25
            };
        }
    },
    
    "/api/timeline": {
        method: "GET",
        response: (params) => {
            if (!params.user_id) {
                throw new Error("Authentication required");
            }
            
            return {
                murmurs: generateDemoMurmurs(10),
                current_page: parseInt(params.page || 1),
                pages: 3,
                total_items: 25
            };
        }
    },
    
    // User endpoints
    "/api/users/search": {
        method: "GET",
        response: (params) => {
            const query = params.q || "";
            if (!query) {
                throw new Error("Search query is required");
            }
            
            return {
                users: generateDemoUsers(5, query),
                current_page: parseInt(params.page || 1),
                pages: 1,
                total_items: 5
            };
        }
    }
};

// Demo data generators
function generateDemoUsers(count, query = "") {
    const users = [];
    const names = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Williams", "Charlie Brown", "David Lee", "Emma Davis"];
    
    for (let i = 0; i < count; i++) {
        const name = names[i % names.length];
        const username = name.toLowerCase().replace(" ", "");
        
        if (query && !name.toLowerCase().includes(query.toLowerCase()) && !username.includes(query.toLowerCase())) {
            continue;
        }
        
        users.push({
            id: i + 1,
            name: name,
            username: username,
            email: `${username}@example.com`,
            bio: `This is ${name}'s bio`,
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            followers_count: Math.floor(Math.random() * 100),
            following_count: Math.floor(Math.random() * 50),
            murmurs_count: Math.floor(Math.random() * 20)
        });
    }
    
    return users;
}

function generateDemoMurmurs(count) {
    const murmurs = [];
    const contents = [
        "Just deployed my new website! Check it out. #webdev #coding",
        "Learning about AI and machine learning today. Fascinating stuff!",
        "Working on a new marketing campaign. So excited to share the results soon!",
        "Just discovered this amazing coffee shop downtown. Their espresso is unbelievable!",
        "Visiting Paris next month! Any recommendations for places to visit?",
        "Just got a new camera for my travel photography. Can't wait to try it out!",
        "Finished reading an amazing book today. Highly recommend it!",
        "Had an incredible hiking trip this weekend. The views were breathtaking!",
        "Started a new project today. Let's see how it goes!",
        "Celebrating 5 years at my company today! Time flies!"
    ];
    
    const users = generateDemoUsers(5);
    
    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        const content = contents[i % contents.length];
        
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i);
        
        murmurs.push({
            id: i + 1,
            content: content,
            user_id: user.id,
            author: user,
            media_type: null,
            media_url: null,
            created_at: timestamp.toISOString(),
            updated_at: timestamp.toISOString(),
            likes_count: Math.floor(Math.random() * 10)
        });
    }
    
    return murmurs;
}

// Override fetch to handle demo API endpoints
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    // Parse the URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url, window.location.origin);
    } catch (e) {
        parsedUrl = new URL(url, window.location.origin);
    }
    
    const path = parsedUrl.pathname;
    const params = Object.fromEntries(parsedUrl.searchParams.entries());
    
    // Check if this is one of our API endpoints
    if (path.startsWith('/api/')) {
        
        console.log(`Proxying request to ${path}`);
        
        // Try using real API first
        try {
            // Forward request to actual API server
            const apiUrl = `${API_SERVER}${path}${parsedUrl.search}`;
            
            console.log(`Attempting real API request to ${apiUrl}`);
            
            const response = await originalFetch(apiUrl, options);
            
            // If we get a successful response, return it
            if (response.ok) {
                console.log('Real API request succeeded');
                return response;
            }
            
            console.log('Real API returned error', await response.text());
            
            // If we have a demo endpoint for this, fall back to that
            if (DEMO_API_ENDPOINTS[path]) {
                console.log('Falling back to demo API');
            } else {
                console.log('No demo fallback available');
                return response;
            }
        } catch (error) {
            console.log('Error with real API, checking for demo fallback:', error);
        }
        
        // Check if we have a demo endpoint for this path
        const endpoint = DEMO_API_ENDPOINTS[path];
        
        if (endpoint) {
            try {
                // Check if method matches
                const method = (options.method || 'GET').toUpperCase();
                
                if (endpoint.method && endpoint.method.toUpperCase() !== method) {
                    throw new Error(`Method ${method} not allowed for ${path}`);
                }
                
                // Get request data
                let requestData = params;
                
                if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                    const contentType = options.headers && options.headers['Content-Type'];
                    
                    if (contentType === 'application/json' && options.body) {
                        requestData = JSON.parse(options.body);
                    } else if (options.body instanceof FormData) {
                        requestData = Object.fromEntries(options.body.entries());
                    }
                }
                
                // Call the endpoint function
                const responseData = endpoint.response(requestData);
                
                // Create a Response object
                return new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                // Return an error response
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
    }
    
    // For all other requests, use the original fetch
    return originalFetch(url, options);
};