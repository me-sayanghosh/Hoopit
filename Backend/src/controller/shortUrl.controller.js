import { shortUrlServiceWithoutUser, shortUrlServicewithUser, getUserShortUrls, getUserUrlAnalytics, getSingleUserUrlAnalytics } from '../services/shortUrl.service.js';
import { getCustomShortUrl } from '../dao/shortUrl.js';
import { recordShortUrlClick } from '../dao/shortUrl.js';
import { AppError } from '../utils/httpError.js';
import wrapasync from '../utils/errorHandeler.js';



import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export const createShortUrl = wrapasync(async (req, res) => {
    const { url, slug, customAlias, tags, comments, title, description, folder, conversionTracking } = req.body;
    const shortAlias = slug || customAlias;

    // Build options to pass through
    const opts = {
        // domain removed from payload
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
        comments: comments || '',
        title: title || '',
        description: description || '',
        folder: folder || '',
        conversionTracking: !!conversionTracking
    };

    let short;
    if (req.user) {
        // Authenticated: allow custom alias or generated
        short = await shortUrlServicewithUser(url, req.user._id, shortAlias || null, opts);
    } else {
        // Unauthenticated: no user metadata is stored other than url
        short = await shortUrlServiceWithoutUser(url, opts);
    }

    // fetch created record to include qrCodeUrl if available
    const record = await getCustomShortUrl(short);

    res.status(201).json({
        shortUrl: process.env.APP_URL + short,
        qrCodeUrl: record?.qrCodeUrl || ''
    });
});

export const createCustomShortUrl = wrapasync(async (req, res) => {
    const { url, slug, customAlias } = req.body;
    const shortAlias = slug || customAlias;
    const shortUrl = await shortUrlServicewithUser(url, req.user._id, shortAlias);
    res.status(201).json({
        shortUrl: process.env.APP_URL + shortUrl
    });
});


export const redirectfromShortUrl = wrapasync(async (req, res) => {
    const { id } = req.params;
    const url = await recordShortUrlClick(id, req, res);

    if (!url) {
        throw new AppError('Short URL not found.', 404);
    }

    res.redirect(url);
});

export const getMyShortUrls = wrapasync(async (req, res) => {
    const urls = await getUserShortUrls(req.user._id);

    res.status(200).json({
        urls: urls.map((item) => ({
            id: item._id,
            originalUrl: item.originalUrl,
            shortUrl: process.env.APP_URL + item.shortUrl,
            folder: item.folder || '',
            clicks: item.clicks,
            createdAt: item.createdAt,
        })),
    });
});

export const getMyShortUrlAnalytics = wrapasync(async (req, res) => {
    const analytics = await getUserUrlAnalytics(req.user._id);

    res.status(200).json(analytics);
});

export const getSingleShortUrlAnalytics = wrapasync(async (req, res) => {
    const { shortUrl } = req.params;
    const analytics = await getSingleUserUrlAnalytics(req.user._id, shortUrl);

    res.status(200).json(analytics);
});

export const recordLocationForClick = wrapasync(async (req, res) => {
    const { shortUrl, latitude, longitude, visitorId, timestamp } = req.body;

    if (!shortUrl || typeof shortUrl !== 'string') {
        throw new AppError('Short URL is required.', 400);
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new AppError('Valid latitude and longitude are required.', 400);
    }

    const urlEntry = await getCustomShortUrl(shortUrl);
    if (!urlEntry) {
        throw new AppError('Short URL not found.', 404);
    }

    if (!urlEntry.clickEvents || urlEntry.clickEvents.length === 0) {
        throw new AppError('No click events found for this URL.', 404);
    }

    // Find the most recent click event, optionally filtered by visitorId
    let targetIndex = -1;
    
    if (visitorId) {
        // If visitorId provided, find the most recent click by this visitor
        for (let i = urlEntry.clickEvents.length - 1; i >= 0; i--) {
            if (urlEntry.clickEvents[i].visitorId === visitorId) {
                targetIndex = i;
                break;
            }
        }
    } else {
        // Otherwise, find the most recent click overall
        targetIndex = urlEntry.clickEvents.length - 1;
    }

    if (targetIndex >= 0) {
        urlEntry.clickEvents[targetIndex].latitude = latitude;
        urlEntry.clickEvents[targetIndex].longitude = longitude;
        await urlEntry.save();
        console.log(`Updated location for click event at index ${targetIndex} for URL ${shortUrl}`);
    } else {
        console.warn(`No matching click event found for URL ${shortUrl}, visitorId: ${visitorId}`);
    }

    res.status(200).json({ 
        success: true,
        message: 'Location recorded',
        updated: targetIndex >= 0
    });
});