import { generateNanoid } from "../utils/helper.js";
import { saveShortUrl, getCustomShortUrl, getShortUrlByOriginalUrl } from "../dao/shortUrl.js";
import { AppError } from "../utils/httpError.js";


export const shortUrlServiceWithoutUser = async (url) => {
    try {
        if (!url) {
            throw new AppError('URL is required.', 400);
        }

        const existingUrl = await getShortUrlByOriginalUrl(url);
        if (existingUrl) {
            throw new AppError('This url already exists', 409);
        }

        const shortUrl = generateNanoid(7);
        if (!shortUrl) {
            throw new AppError('Short URL not generated', 500);
        }
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

export const shortUrlServicewithUser = async (url, userId, slug = null) => {
    try {
        if (!url) {
            throw new AppError('URL is required.', 400);
        }

        const existingUrl = await getShortUrlByOriginalUrl(url);
        if (existingUrl) {
            throw new AppError('This url already exists', 409);
        }

        const shortUrl = slug || generateNanoid(7);
        const exists = await getCustomShortUrl(shortUrl);
        if (exists) {
            throw new AppError('This custom url already exists', 409);
        }

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