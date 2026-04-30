import { restApi } from '../lib/api';

export interface UserStats {
    _id: string;
    userId: string;
    totalPoints: number;
    level: number;
    itemsScanned: number;
    streakDays: number;
    badges: Badge[];
    createdAt: string;
    updatedAt: string;
}

export interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

export interface Leaderboard {
    rank: number;
    user: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email: string;
    };
    points: number;
    level: number;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
    const response = await restApi.get(`/game/stats/${userId}`);
    return response.data.data;
};

export const getLeaderboard = async (limit: number = 10): Promise<Leaderboard[]> => {
    const response = await restApi.get(`/game/leaderboard?limit=${limit}`);
    return response.data.data;
};

export const addPoints = async (points: number, activity: string): Promise<UserStats> => {
    const response = await restApi.post('/game/points', { points, activity });
    return response.data.data;
};

export const claimBadge = async (badgeId: string): Promise<Badge> => {
    const response = await restApi.post(`/game/badges/${badgeId}/claim`);
    return response.data.data;
};