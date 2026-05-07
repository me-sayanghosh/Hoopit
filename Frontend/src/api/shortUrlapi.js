import axios from "axios";


export const shortenUrl = async (url) => {
        const { data } = await axios.post("/api/create", { url });
        return data;
}