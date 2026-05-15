import axiosInstance from "../utils/axiosInstance";

const AUTH_BASE_PATH = '/api/auth';

export const loginUser = async (email, password) => {
    const response = await axiosInstance.post(`${AUTH_BASE_PATH}/login`, { email, password });
    return response.data;
}

export const registerUser = async (name, email, password) => {
    const response = await axiosInstance.post(`${AUTH_BASE_PATH}/register`, { name, email, password });
    return response.data;
}

export const logOutUser = async () => {
    await axiosInstance.post(`${AUTH_BASE_PATH}/logout`);
}

export const getCurrentUser = async () => {
    const { data } = await axiosInstance.get(`${AUTH_BASE_PATH}/me`);
    return data;
}