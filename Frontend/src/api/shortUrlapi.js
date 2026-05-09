import axiosInstance from "../utils/axiosInstance";

export const shortenUrl = async (url) => {
        const { data } = await axiosInstance.post("/api/create", { url });
        return data;
};