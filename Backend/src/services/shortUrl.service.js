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
        const uniqueClicks = urls.reduce((sum, item) => sum + (item.uniqueClicks || 0), 0);
        const topUrl = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0] || null;
        const recentUrls = urls.slice(0, 5);

        const clickEvents = urls.flatMap((item) => (item.clickEvents || []).map((event) => ({
            shortUrl: item.shortUrl,
            clickedAt: event.clickedAt || item.lastClickedAt || item.createdAt,
            referrer: event.referrer || 'Direct',
            country: event.country || 'Unknown',
            region: event.region || 'Unknown',
            city: event.city || 'Unknown',
            device: event.device || 'Desktop',
            browser: event.browser || 'Unknown',
        })));

        const countBy = (items, selector) => {
            const counts = new Map();
            items.forEach((item) => {
                const key = selector(item) || 'Unknown';
                counts.set(key, (counts.get(key) || 0) + 1);
            });

            return [...counts.entries()]
                .sort((first, second) => second[1] - first[1])
                .map(([label, value]) => ({ label, value }));
        };

        const recentWindowStart = Date.now() - (1000 * 60 * 60 * 24);
        const recentClicks = clickEvents.filter((event) => new Date(event.clickedAt).getTime() >= recentWindowStart);
        const clicksByHourMap = new Map();
        for (let hour = 0; hour < 24; hour += 1) {
            clicksByHourMap.set(hour, 0);
        }

        recentClicks.forEach((event) => {
            const date = new Date(event.clickedAt);
            const hour = Number.isNaN(date.getTime()) ? 0 : date.getHours();
            clicksByHourMap.set(hour, (clicksByHourMap.get(hour) || 0) + 1);
        });

        const realtimeClicks = [...clicksByHourMap.entries()].map(([hour, value]) => ({
            label: `${hour.toString().padStart(2, '0')}:00`,
            value,
        }));

        const topReferrers = countBy(clickEvents, (event) => event.referrer).slice(0, 8);
        const trafficByCountry = countBy(clickEvents, (event) => event.country).slice(0, 8);
        const trafficByDevice = countBy(clickEvents, (event) => event.device).slice(0, 8);
        const trafficByBrowser = countBy(clickEvents, (event) => event.browser).slice(0, 8);

        return {
            totalUrls,
            totalClicks,
            uniqueClicks,
            averageClicks: totalUrls ? Number((totalClicks / totalUrls).toFixed(1)) : 0,
            realtimeClicks,
            topReferrers,
            trafficByCountry,
            trafficByDevice,
            trafficByBrowser,
            topUrl: topUrl
                ? {
                    id: topUrl._id,
                    originalUrl: topUrl.originalUrl,
                    shortUrl: process.env.APP_URL + topUrl.shortUrl,
                    clicks: topUrl.clicks,
                    uniqueClicks: topUrl.uniqueClicks || 0,
                    createdAt: topUrl.createdAt,
                }
                : null,
            recentUrls: recentUrls.map((item) => ({
                id: item._id,
                originalUrl: item.originalUrl,
                shortUrl: process.env.APP_URL + item.shortUrl,
                clicks: item.clicks,
                uniqueClicks: item.uniqueClicks || 0,
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