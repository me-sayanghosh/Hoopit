import axiosInstance from "../utils/axiosInstance";

export const shortenUrl = async (url) => {
        const { data } = await axiosInstance.post("/api/create", { url });
        return data;
};

export const createCustomShortUrl = async (url, customAlias) => {
        const { data } = await axiosInstance.post("/api/create/custom", {
                url,
                customAlias,
        });

        return data;
};