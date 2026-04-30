import { restApi } from '../lib/api';

export interface User {
    _id: string;
    name: string;
    email: string;
    phoneNumber: {
        isoCode: string;
        countryCode: string;
        internationalNumber: string;
    };
    timezone: string;
    role: string;
    accountConfimation: {
        status: boolean;
        token: string;
        code: string;
        timestamp: Date | null;
    };
    lastLoginAt: Date | null;
    consent: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    consent: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await restApi.post('/login', credentials);
    
    // Store tokens in localStorage
    if (response.data.success) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await restApi.post('/register', userData);
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        await restApi.put('/logout');
    } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('accessToken');
};