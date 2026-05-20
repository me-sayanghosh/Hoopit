import axiosInstance from "../utils/axiosInstance";

const AUTH_BASE_PATH = '/api/auth';
const CURRENT_USER_CACHE_KEY = 'hoopit.currentUser';

const cacheCurrentUser = (user) => {
    if (typeof window === 'undefined') return;

    if (!user) {
        window.localStorage.removeItem(CURRENT_USER_CACHE_KEY);
        return;
    }

    window.localStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify(user));
}

export const getCachedCurrentUser = () => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(CURRENT_USER_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        window.localStorage.removeItem(CURRENT_USER_CACHE_KEY);
        return null;
    }
}

export const loginUser = async (email, password) => {
    const response = await axiosInstance.post(`${AUTH_BASE_PATH}/login`, { email, password });
    const currentUser = await getCurrentUser();
    return { ...response.data, user: currentUser?.user };
}

export const registerUser = async (name, email, password) => {
    const response = await axiosInstance.post(`${AUTH_BASE_PATH}/register`, { name, email, password });
    const currentUser = await getCurrentUser();
    return { ...response.data, user: currentUser?.user };
}

export const logOutUser = async () => {
    try {
        await axiosInstance.post(`${AUTH_BASE_PATH}/logout`);
    } finally {
        cacheCurrentUser(null);
    }
}

export const requestPasswordReset = async (email) => {
    const { data } = await axiosInstance.post(`${AUTH_BASE_PATH}/forgot-password`, { email });
    return data;
}

export const verifyPasswordResetCode = async (email, code) => {
    const { data } = await axiosInstance.post(`${AUTH_BASE_PATH}/verify-reset-code`, { email, code });
    return data;
}

export const resetPassword = async (email, code, password) => {
    const { data } = await axiosInstance.post(`${AUTH_BASE_PATH}/reset-password`, { email, code, password });
    return data;
}

export const getCurrentUser = async () => {
    const { data } = await axiosInstance.get(`${AUTH_BASE_PATH}/me`);
    cacheCurrentUser(data?.user || null);
    return data;
}

export const updateUserProfile = async (name) => {
    const { data } = await axiosInstance.put(`${AUTH_BASE_PATH}/me`, { name });
    cacheCurrentUser(data?.user || null);
    return data;
}

export const deleteUserProfile = async () => {
    const { data } = await axiosInstance.delete(`${AUTH_BASE_PATH}/me`);
    cacheCurrentUser(null);
    return data;
}
