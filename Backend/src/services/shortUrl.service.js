import { generateNanoid } from "../utils/helper.js";
import { saveShortUrl, getCustomShortUrl, getShortUrlByOriginalUrl, getShortUrlsByUserId } from "../dao/shortUrl.js";
import { toDataURL } from 'qrcode';
import { AppError } from "../utils/httpError.js";

const regionNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

const getCountryLabel = (value) => {
    if (!value) return 'Unknown';

    const normalized = String(value).trim();
    if (!normalized) return 'Unknown';

    if (/^[A-Z]{2}$/.test(normalized)) {
        return regionNames?.of(normalized) || normalized;
    }

    return normalized;
};

const getDeviceLabel = (value) => {
    const normalized = String(value || '').trim().toLowerCase();

    if (!normalized || normalized === 'desktop') {
        return 'Desktop';
    }

    if (normalized === 'mobile') {
        return 'Mobile';
    }

    if (normalized === 'tablet') {
        return 'Tablet';
    }

    return 'Other';
};


export const shortUrlServiceWithoutUser = async (url, opts = {}) => {
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
        const saved = await saveShortUrl(Object.assign({ originalUrl: url, shortUrl }, opts));

        // generate QR code pointing to the public short URL
        try {
            const full = `${process.env.APP_URL || ''}${process.env.APP_URL && !process.env.APP_URL.endsWith('/') ? '/' : ''}${shortUrl}`;
            const dataUrl = await toDataURL(full);
            await saved.updateOne({ qrCodeUrl: dataUrl });
        } catch (e) {
            // log QR failures for debugging
            console.error('Failed to generate QR for', shortUrl, e?.message || e);
        }

        return shortUrl;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(err.message || 'Failed to create short URL.', 500);
    }
}

export const shortUrlServicewithUser = async (url, userId, slug = null, opts = {}) => {
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

        const saved = await saveShortUrl(Object.assign({ originalUrl: url, shortUrl, userId }, opts));

        try {
            const full = `${process.env.APP_URL || ''}${process.env.APP_URL && !process.env.APP_URL.endsWith('/') ? '/' : ''}${shortUrl}`;
            const dataUrl = await toDataURL(full);
            await saved.updateOne({ qrCodeUrl: dataUrl });
        } catch (e) {
            console.error('Failed to generate QR for', shortUrl, e?.message || e);
        }

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
            country: getCountryLabel(event.country),
            region: event.region || 'Unknown',
            city: event.city || 'Unknown',
            latitude: typeof event.latitude === 'number' ? event.latitude : null,
            longitude: typeof event.longitude === 'number' ? event.longitude : null,
            device: getDeviceLabel(event.device),
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
        const trafficByCity = countBy(clickEvents, (event) => {
            const city = event.city || 'Unknown';
            const region = event.region || '';

            if (city === 'Unknown' && !region) {
                return 'Unknown';
            }

            return region ? `${city}, ${region}` : city;
        }).slice(0, 8);
        const trafficByDevice = countBy(clickEvents, (event) => event.device).slice(0, 8);
        const trafficByBrowser = countBy(clickEvents, (event) => event.browser).slice(0, 8);
        const clickMapPoints = clickEvents
            .filter((event) => typeof event.latitude === 'number' && typeof event.longitude === 'number')
            .map((event) => ({
                shortUrl: event.shortUrl,
                city: event.city,
                region: event.region,
                country: event.country,
                latitude: event.latitude,
                longitude: event.longitude,
                device: event.device,
                clickedAt: event.clickedAt,
            }));

        return {
            totalUrls,
            totalClicks,
            uniqueClicks,
            averageClicks: totalUrls ? Number((totalClicks / totalUrls).toFixed(1)) : 0,
            realtimeClicks,
            topReferrers,
            trafficByCountry,
            trafficByCity,
            trafficByDevice,
            trafficByBrowser,
            clickMapPoints,
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