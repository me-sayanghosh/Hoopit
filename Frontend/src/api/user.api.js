import axiosInstance from "../utils/axiosInstance";

export const loginUser = async (email, password) => {
    try {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }   
}

export const registerUser = async (name, email, password) => {
    try {
        const response = await axiosInstance.post('/auth/register', { name, email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
}

export const logOutUser = async () => {
    try {
        await axiosInstance.post('/auth/logout');
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
}