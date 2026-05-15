import { generateNanoid } from "../utils/helper.js";
import { saveShortUrl, getCustomShortUrl, getShortUrlByOriginalUrl, getShortUrlsByUserId } from "../dao/shortUrl.js";
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

export const getUserShortUrls = async (userId) => {
    try {
        if (!userId) {
            throw new AppError('User id is required.', 400);
        }

        return await getShortUrlsByUserId(userId);
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(err.message || 'Failed to fetch user URLs.', 500);
    }
}

export const getUserUrlAnalytics = async (userId) => {
    try {
        const urls = await getUserShortUrls(userId);
        const totalUrls = urls.length;
        const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);
        const topUrl = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0] || null;
        const recentUrls = urls.slice(0, 5);

        return {
            totalUrls,
            totalClicks,
            averageClicks: totalUrls ? Number((totalClicks / totalUrls).toFixed(1)) : 0,
            topUrl: topUrl
                ? {
                    id: topUrl._id,
                    originalUrl: topUrl.originalUrl,
                    shortUrl: topUrl.shortUrl,
                    clicks: topUrl.clicks,
                    createdAt: topUrl.createdAt,
                }
                : null,
            recentUrls: recentUrls.map((item) => ({
                id: item._id,
                originalUrl: item.originalUrl,
                shortUrl: item.shortUrl,
                clicks: item.clicks,
                createdAt: item.createdAt,
            })),
        };
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(err.message || 'Failed to build user analytics.', 500);
    }
}