import axios from 'axios';

// Get API URLs from environment variables (with fallbacks for development)
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
const REST_API_URL = import.meta.env.VITE_REST_API_URL || 'http://localhost:3000/v1';

// Create separate instances for different services
export const aiApi = axios.create({
    baseURL: AI_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const restApi = axios.create({
    baseURL: REST_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor for REST API
restApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Default export for backward compatibility
export default restApi;
