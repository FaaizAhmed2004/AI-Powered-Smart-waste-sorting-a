import { restApi } from '../lib/api';

export interface EducationalContent {
    _id: string;
    title: string;
    content: string;
    category: 'recycling' | 'environment' | 'sustainability' | 'waste-management';
    imageUrl?: string;
    videoUrl?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Quiz {
    _id: string;
    title: string;
    description: string;
    questions: QuizQuestion[];
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    pointsReward: number;
    createdAt: string;
}

export interface QuizQuestion {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface QuizResult {
    _id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    pointsEarned: number;
    completedAt: string;
}

export const getEducationalContent = async (category?: string): Promise<EducationalContent[]> => {
    const url = category ? `/education/content?category=${category}` : '/education/content';
    const response = await restApi.get(url);
    return response.data.data;
};

export const getContentById = async (id: string): Promise<EducationalContent> => {
    const response = await restApi.get(`/education/content/${id}`);
    return response.data.data;
};

export const getQuizzes = async (category?: string): Promise<Quiz[]> => {
    const url = category ? `/education/quizzes?category=${category}` : '/education/quizzes';
    const response = await restApi.get(url);
    return response.data.data;
};

export const getQuizById = async (id: string): Promise<Quiz> => {
    const response = await restApi.get(`/education/quizzes/${id}`);
    return response.data.data;
};

export const submitQuizAnswers = async (quizId: string, answers: number[]): Promise<QuizResult> => {
    const response = await restApi.post(`/education/quizzes/${quizId}/submit`, { answers });
    return response.data.data;
};

export const getUserQuizHistory = async (userId: string): Promise<QuizResult[]> => {
    const response = await restApi.get(`/education/quizzes/history/${userId}`);
    return response.data.data;
};