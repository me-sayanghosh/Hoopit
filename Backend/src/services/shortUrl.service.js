import { generateNanoid } from "../utils/helper.js";
import { saveShortUrl } from "../dao/shortUrl.js";
import { AppError } from "../utils/httpError.js";


export const shortUrlServiceWithoutUser =async (url) => {
    try {
        if (!url) {
            throw new AppError('URL is required.', 400);
        }

        const shortUrl = generateNanoid(8);
        await saveShortUrl(url, shortUrl);
        return shortUrl;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(err.message || 'Failed to create short URL.', 500);
    }
}

export const shortUrlServicewithUser =async (url, userId) => {
    try {
        if (!url) {
            throw new AppError('URL is required.', 400);
        }

        const shortUrl = generateNanoid(8);
        await saveShortUrl(url, shortUrl, userId);
        return shortUrl;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(err.message || 'Failed to create short URL.', 500);
    }
}