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

export const generateAiSuggestion = async (url, field) => {
        const { data } = await axiosInstance.post('/api/create/suggest', { url, field });
        return data;
};

export const updateShortUrl = async (id, body) => {
        const { data } = await axiosInstance.patch(`/api/create/${id}`, body);
        return data;
};

export const deleteShortUrl = async (id) => {
        const { data } = await axiosInstance.delete(`/api/create/${id}`);
        return data;
};

export const transferShortUrl = async (id, email) => {
        const { data } = await axiosInstance.post(`/api/create/${id}/transfer`, { email });
        return data;
};

export const getArchivedShortUrls = async () => {
        const { data } = await axiosInstance.get('/api/create/archived');
        return data;
};

export const getTags = async () => {
        const { data } = await axiosInstance.get('/api/create/tags');
        return data;
};

export const getUrlsByTag = async (tag) => {
        const { data } = await axiosInstance.get(`/api/create/tags/${encodeURIComponent(tag)}`);
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