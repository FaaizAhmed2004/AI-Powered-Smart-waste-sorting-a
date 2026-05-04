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
    withCredentials: true,
});

// Add auth token interceptor for REST API
restApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle token refresh
restApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshResponse = await restApi.post('/refresh', {
                    refreshToken: localStorage.getItem('refreshToken')
                });
                
                if (refreshResponse.data.success) {
                    const { accessToken, refreshToken } = refreshResponse.data.data;
                    
                    // Update stored tokens
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return restApi(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Default export for backward compatibility
export default restApi;
