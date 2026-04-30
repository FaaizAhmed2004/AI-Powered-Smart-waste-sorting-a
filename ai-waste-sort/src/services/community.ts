import { restApi } from '../lib/api';

export interface CommunityPost {
    _id: string;
    userId: string;
    title: string;
    content: string;
    imageUrl?: string;
    likes: number;
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    imageUrl?: string;
}

export const getCommunityPosts = async (): Promise<CommunityPost[]> => {
    const response = await restApi.get('/community/posts');
    return response.data.data;
};

export const createPost = async (postData: CreatePostRequest): Promise<CommunityPost> => {
    const response = await restApi.post('/community/posts', postData);
    return response.data.data;
};

export const likePost = async (postId: string): Promise<void> => {
    await restApi.post(`/community/posts/${postId}/like`);
};

export const addComment = async (postId: string, content: string): Promise<Comment> => {
    const response = await restApi.post(`/community/posts/${postId}/comments`, { content });
    return response.data.data;
};