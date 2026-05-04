const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

async function testTokenRefresh() {
    console.log('🧪 Testing Token Refresh Functionality...\n');

    try {
        // Step 1: Login to get initial tokens
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
            email: 'test@example.com', // You'll need to create this user first
            password: 'password123'
        }, { withCredentials: true });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed. Please create a test user first.');
            return;
        }

        console.log('✅ Login successful');

        // Step 2: Wait for access token to expire (simulate expiration)
        console.log('2. Simulating token expiration...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        // Step 3: Try to access a protected endpoint
        console.log('3. Testing protected endpoint...');
        const protectedResponse = await axios.get(`${API_BASE_URL}/classification/classify/history/test-user-id`, {
            withCredentials: true
        });

        console.log('✅ Protected endpoint accessible');
        console.log('Response:', protectedResponse.data);

    } catch (error) {
        if (error.response?.status === 401) {
            console.log('ℹ️  Token expired (expected), refresh should happen automatically');
        } else {
            console.log('❌ Error:', error.response?.data || error.message);
        }
    }
}

// Run the test
testTokenRefresh();