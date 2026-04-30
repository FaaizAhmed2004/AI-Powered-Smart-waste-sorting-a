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
});

// Override the interceptor for admin tokens
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Authentication
export const adminLogin = async (credentials: AdminLoginRequest): Promise<AdminAuthResponse> => {
    const response = await adminApi.post('/admin/login', credentials);
    
    if (response.data.success) {
        localStorage.setItem('adminAccessToken', response.data.data.accessToken);
        localStorage.setItem('adminRefreshToken', response.data.data.refreshToken);
        localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
    }
    
    return response.data;
};

export const adminRegister = async (userData: AdminRegisterRequest): Promise<AdminAuthResponse> => {
    const response = await adminApi.post('/admin/register', userData);
    
    if (response.data.success) {
        localStorage.setItem('adminAccessToken', response.data.data.accessToken);
        localStorage.setItem('adminRefreshToken', response.data.data.refreshToken);
        localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
    }
    
    return response.data;
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
    const adminStr = localStorage.getItem('admin');
    return adminStr ? JSON.parse(adminStr) : null;
};

export const isAdminAuthenticated = (): boolean => {
    return !!localStorage.getItem('adminAccessToken');
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