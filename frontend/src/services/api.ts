import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

import { auth } from '../firebase';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the Firebase Auth Token
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export interface AnalysisResponse {
    credibility_score: number;
    verdict: string;
    explanation: string;
    red_flags: string[];
    sentiment_analysis?: {
        polarity: number;
        subjectivity: number;
    };
    ml_breakdown?: {
        fake_prob: number;
        real_prob: number;
        opinion_prob: number;
    };
    category?: string;
    verified_sources?: string[];
    translated_content?: string;
    news_coverage?: any;
}

export const analyzeContent = async (text: string, type: 'text' | 'url') => {
    const payload = type === 'url' ? { url: text } : { text: text };
    const response = await api.post<AnalysisResponse>('/analyze', payload);
    console.log("[DEBUG] API Response:", response.data);
    return response.data;
};

export const fetchHistory = async () => {
    const response = await api.get<any[]>('/history/');
    return response.data;
};

export const fetchInsights = async () => {
    const response = await api.get<any>('/history/insights');
    return response.data;
};

export const chatWithBot = async (message: string, history: any[] = []) => {
    const response = await api.post<{ reply: string }>('/chat', { message, history });
    return response.data;
};

// --- Blogs / Community API ---
export interface Comment {
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

export interface BlogPost {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author: {
        uid: string;
        name: string;
        photo_url?: string;
    };
    created_at: string;
    likes: number;
    liked_by: string[];
    comments: Comment[];
}

export const getPosts = async () => {
    const response = await api.get<BlogPost[]>('/blogs');
    return response.data;
};

export const createPost = async (title: string, content: string, category: string = "General", tags: string[] = []) => {
    const response = await api.post<BlogPost>('/blogs', { title, content, category, tags });
    return response.data;
};

export const addComment = async (postId: string, content: string) => {
    const response = await api.post<BlogPost>(`/blogs/${postId}/comments`, { content });
    return response.data;
};

export const likePost = async (postId: string) => {
    const response = await api.post<BlogPost>(`/blogs/${postId}/like`);
    return response.data;
};

// --- User profile API ---
export interface UserProfile {
    uid: string;
    email: string;
    name?: string;
    phone?: string;
    photo_url?: string;
}

export const updateUserProfile = async (profile: Partial<UserProfile>) => {
    const response = await api.post('/users/profile', profile);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
};

export interface UserStats {
    topics_shared: number;
    total_reactions: number;
    avg_accuracy: string;
    streak: string;
    rank: string;
}

export const getUserStats = async () => {
    const response = await api.get<UserStats>('/users/stats');
    return response.data;
};

export default api;
