import axiosInstance from "../utils/axiosInstance";

const AUTH_BASE_PATH = '/api/auth';

export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post(`${AUTH_BASE_PATH}/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }   
}

export const registerUser = async (name, email, password) => {
    try {
        const response = await axiosInstance.post(`${AUTH_BASE_PATH}/register`, { name, email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
}

export const logOutUser = async () => {
    try {
        await axiosInstance.post(`${AUTH_BASE_PATH}/logout`);
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
}