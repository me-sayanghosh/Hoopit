import { shortUrlServiceWithoutUser, shortUrlServicewithUser, getUserShortUrls, getUserUrlAnalytics } from '../services/shortUrl.service.js';
import { getCustomShortUrl } from '../dao/shortUrl.js';
import { recordShortUrlClick } from '../dao/shortUrl.js';
import { AppError } from '../utils/httpError.js';
import wrapasync from '../utils/errorHandeler.js';



import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export const createShortUrl = wrapasync(async (req, res) => {
    const { url, slug, customAlias, domain, tags, comments, title, description, folder, conversionTracking } = req.body;
    const shortAlias = slug || customAlias;

    // Build options to pass through
    const opts = {
        domain: domain || '',
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
            clicks: item.clicks,
            createdAt: item.createdAt,
        })),
    });
});

export const getMyShortUrlAnalytics = wrapasync(async (req, res) => {
    const analytics = await getUserUrlAnalytics(req.user._id);

    res.status(200).json(analytics);
});