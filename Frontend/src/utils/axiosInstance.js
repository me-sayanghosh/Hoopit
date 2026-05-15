import axios from "axios";

const FALLBACK_BASE_URL = "http://localhost:3000";
const baseURL = import.meta.env.VITE_API_BASE_URL || FALLBACK_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const serverMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.response?.data?.details;

        const message =
            serverMessage ||
            error?.message ||
            "Something went wrong. Please try again.";

        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;
