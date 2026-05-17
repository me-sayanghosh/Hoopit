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

export const getSingleShortUrlAnalytics = async (shortUrl) => {
        const { data } = await axiosInstance.get(`/api/create/analytics/${shortUrl}`);
        return data;
};


export const getFolders = async () => {
        const { data } = await axiosInstance.get('/api/folders');
        return data?.folders || [];
};

export const createFolder = async (body) => {
        const { data } = await axiosInstance.post('/api/folders', body);
        return data?.folder;
};

export const updateFolder = async (folderId, body) => {
        const { data } = await axiosInstance.put(`/api/folders/${folderId}`, body);
        return data?.folder;
};