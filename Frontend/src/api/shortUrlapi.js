import axiosInstance from "../utils/axiosInstance";

export const shortenUrl = async (body) => {
        const { data } = await axiosInstance.post("/api/create", body);
        return data;
};

export const createCustomShortUrl = async (url, customAlias) => {
        const { data } = await axiosInstance.post("/api/create/custom", {
                url,
                customAlias,
        });

        return data;
};

export const getMyShortUrls = async () => {
        const { data } = await axiosInstance.get('/api/create/mine');
        return data;
};

export const getMyShortUrlAnalytics = async () => {
        const { data } = await axiosInstance.get('/api/create/analytics');
        return data;
};

export const getDomains = async () => {
        const { data } = await axiosInstance.get('/api/domains');
        return data?.domains || [];
};

export const createDomain = async (domain) => {
        const { data } = await axiosInstance.post('/api/domains', { domain });
        return data?.domain;
};