import axios from "axios";

const FALLBACK_BASE_URL = import.meta.env.PROD
    ? "https://hoopit.onrender.com"
    : "http://localhost:3000";
const baseURL = import.meta.env.VITE_API_BASE_URL || FALLBACK_BASE_URL;

const TOKEN_STORAGE_KEY = "hoopit.authToken";

/**
 * Persist the JWT so it survives page reloads.
 * Called after every successful login / register / google-auth response.
 */
export const saveToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
};

/** Remove the stored JWT (used on logout). */
export const clearToken = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
};

/** Read the stored JWT (may return null). */
export const getToken = () => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor ──────────────────────────────────────────────
// Attach the Authorization header from localStorage on every request.
// This is the Safari ITP fallback: when cookies are blocked, this header
// is the only way the backend can identify the user.
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor ─────────────────────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        // If the backend says 401 (token expired / invalid) and we are NOT
        // on a login/register endpoint (where 401 means wrong credentials),
        // clear all stale auth data and bounce to the login page.
        if (status === 401) {
            const url = error?.config?.url || "";
            const isAuthEndpoint =
                url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/google");

            if (!isAuthEndpoint) {
                clearToken();
                localStorage.removeItem("hoopit.currentUser");

                // Only redirect if we're not already on the login page
                if (
                    typeof window !== "undefined" &&
                    !window.location.pathname.startsWith("/login")
                ) {
                    window.location.replace("/login");
                }
            }
        }

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
