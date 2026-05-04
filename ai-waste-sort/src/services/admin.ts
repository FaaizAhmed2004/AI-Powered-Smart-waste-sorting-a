import { restApi } from '../lib/api';
import axios from 'axios';

export interface Admin {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'super_admin' | 'admin';
    permissions: string[];
    isActive: boolean;
    createdAt: string;
}

export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminRegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'super_admin' | 'admin';
    permissions?: string[];
}

export interface AdminAuthResponse {
    success: boolean;
    message: string;
    data: {
        admin: Admin;
        accessToken: string;
        refreshToken: string;
    };
}

export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalClassifications: number;
        totalAdmins: number;
        activeUsers: number;
    };
    recentActivity: {
        recentUsers: Array<Record<string, unknown>>;
        recentClassifications: Array<Record<string, unknown>>;
    };
    analytics: {
        classificationsByCategory: Array<{ _id: string; count: number }>;
        userRegistrationsByMonth: Array<{ _id: { year: number; month: number }; count: number }>;
    };
}

export interface UserWithStats {
    _id: string;
    email: string;
    name: string;
    accountConfimation: {
        status: boolean;
    };
    createdAt: string;
    classificationCount: number;
}

export interface PaginatedUsers {
    users: UserWithStats[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface ClassificationWithUser {
    _id: string;
    userId: {
        _id: string;
        email: string;
        name: string;
    };
    imageUrl: string;
    label: string;
    confidence: number;
    createdAt: string;
}

export interface PaginatedClassifications {
    classifications: ClassificationWithUser[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalClassifications: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Create admin API instance with different token handling
const importMeta = import.meta as unknown as { env?: { VITE_API_URL?: string } };
const API_BASE_URL = importMeta.env?.VITE_API_URL || 'http://localhost:3000/v1';
const adminApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Override the interceptor for admin tokens (but only for authenticated requests)
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminAccessToken');
    // Only add auth header if token exists and we're not on a login/register endpoint
    if (token && !config.url?.includes('/admin/login') && !config.url?.includes('/admin/register')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for admin API to handle token refresh
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // For admin, we don't have a refresh endpoint yet, so redirect to login
                localStorage.removeItem('adminAccessToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('admin');
                window.location.href = '/admin/login';
                return Promise.reject(error);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const safeParseAdmin = (adminStr: string | null): Admin | null => {
    if (!adminStr) return null;

    try {
        return JSON.parse(adminStr) as Admin;
    } catch (error) {
        console.warn("Invalid admin data in localStorage, clearing stale value.", error);
        localStorage.removeItem('admin');
        return null;
    }
};

// Authentication
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminAuthResponse> => {
    try {
        console.log('Admin login attempt with email:', credentials.email);
        console.log('API Base URL:', API_BASE_URL);
        
        const response = await adminApi.post('/admin/login', credentials);
        
        console.log('Admin login response:', response.status);
        const payload = response.data?.data ?? response.data;
        
        if (payload?.success && payload.data?.admin) {
            localStorage.setItem('adminAccessToken', payload.data.accessToken);
            localStorage.setItem('adminRefreshToken', payload.data.refreshToken);
            localStorage.setItem('admin', JSON.stringify(payload.data.admin));
        }
        
        return payload;
    } catch (error: any) {
        console.error('Admin login error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
        throw error;
    }
};

export const adminRegister = async (userData: AdminRegisterRequest): Promise<AdminAuthResponse> => {
    const response = await adminApi.post('/admin/register', userData);
    const payload = response.data?.data ?? response.data;
    
    if (payload?.success && payload.data?.admin) {
        localStorage.setItem('adminAccessToken', payload.data.accessToken);
        localStorage.setItem('adminRefreshToken', payload.data.refreshToken);
        localStorage.setItem('admin', JSON.stringify(payload.data.admin));
    }
    
    return payload;
};

export const adminLogout = async (): Promise<void> => {
    try {
        await adminApi.post('/admin/logout');
    } finally {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('admin');
    }
};

export const getCurrentAdmin = (): Admin | null => {
    return safeParseAdmin(localStorage.getItem('admin'));
};

export const isAdminAuthenticated = (): boolean => {
    return !!localStorage.getItem('adminAccessToken') && !!getCurrentAdmin();
};

// Dashboard APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data.data;
};

export const getAllUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedUsers> => {
    const response = await adminApi.get('/admin/users', { params });
    return response.data.data;
};

export const getUserById = async (userId: string): Promise<{
    user: UserWithStats;
    classifications: Array<Record<string, unknown>>;
    stats: Record<string, unknown>;
}> => {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data.data;
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<UserWithStats> => {
    const response = await adminApi.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await adminApi.delete(`/admin/users/${userId}`);
};

export const getAllClassifications = async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedClassifications> => {
    const response = await adminApi.get('/admin/classifications', { params });
    return response.data.data;
};

export const deleteClassification = async (classificationId: string): Promise<void> => {
    await adminApi.delete(`/admin/classifications/${classificationId}`);
};