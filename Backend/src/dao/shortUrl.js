import urlSchema from '../models/shorturl.model.js';
import { AppError } from '../utils/httpError.js';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { randomUUID } from 'node:crypto';

const VISITOR_COOKIE = 'hoopit_visitor_id';

const normalizeIp = (value) => {
    if (!value) return '';
    return String(value).replace(/^::ffff:/, '').trim();
};

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded && typeof forwarded === 'string') {
        return normalizeIp(forwarded.split(',')[0]);
    }

    return normalizeIp(req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress);
};

const getVisitorId = (req, res) => {
    const existing = req.cookies?.[VISITOR_COOKIE];
    if (existing) return existing;

    const visitorId = randomUUID();
    res.cookie(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return visitorId;
};

const getReferrer = (req) => {
    const referrer = req.get('referer') || req.get('referrer') || '';
    if (!referrer) return 'Direct';

    try {
        return new URL(referrer).hostname || referrer;
    } catch {
        return referrer;
    }
};

const getLocation = (req, ip) => {
    const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const city = req.headers['x-vercel-ip-city'] || '';

    if (country || region || city) {
        return {
            country: country || 'Unknown',
            region: region || 'Unknown',
            city: city || 'Unknown',
        };
    }

    const lookup = ip ? geoip.lookup(ip) : null;
    return {
        country: lookup?.country || 'Unknown',
        region: lookup?.region || 'Unknown',
        city: lookup?.city || 'Unknown',
    };
};

const getDeviceInfo = (req) => {
    const parser = new UAParser(req.get('user-agent') || '');
    const result = parser.getResult();

    const deviceType = result.device?.type || 'desktop';
    const deviceLabel = deviceType === 'desktop'
        ? 'Desktop'
        : deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

    const browserName = result.browser?.name || 'Unknown browser';

    return {
        device: deviceLabel,
        browser: browserName,
    };
};


export const saveShortUrl = async (opts = {}) => {
    const { originalUrl, shortUrl, userId, alias, domain, tags, comments, title, description, folder, conversionTracking, qrCodeUrl } = opts;
    try {
        const newUrl = new urlSchema({
            originalUrl,
            shortUrl,
            alias: alias || '',
            domain: domain || '',
            tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(s => s.trim()).filter(Boolean) : []),
            comments: comments || '',
            title: title || '',
            description: description || '',
            folder: folder || '',
            conversionTracking: !!conversionTracking,
            qrCodeUrl: qrCodeUrl || ''
        });

        if (userId) {
            newUrl.user = userId;
        }

        const saved = await newUrl.save();
        return saved;
    }
    catch (err) {
        if (err.code === 11000) {
            throw new AppError('Short URL already exists. Please try again.', 409);
        }

        throw new AppError(err.message || 'Failed to save short URL.', 500);
    }
}



export const recordShortUrlClick = async (shortUrl, req, res) => {
    try {
        const urlEntry = await urlSchema.findOne({ shortUrl });
        if (!urlEntry) {
            return null;
        }

        const visitorId = getVisitorId(req, res);
        const ip = getClientIp(req);
        const referrer = getReferrer(req);
        const location = getLocation(req, ip);
        const deviceInfo = getDeviceInfo(req);
        const now = new Date();
        const isUnique = !(urlEntry.uniqueVisitors || []).includes(visitorId);

        await urlSchema.updateOne(
            { _id: urlEntry._id },
            {
                $inc: {
                    clicks: 1,
                    ...(isUnique ? { uniqueClicks: 1 } : {}),
                },
                $addToSet: {
                    uniqueVisitors: visitorId,
                },
                $push: {
                    clickEvents: {
                        clickedAt: now,
                        visitorId,
                        ip,
                        country: location.country,
                        region: location.region,
                        city: location.city,
                        referrer,
                        device: deviceInfo.device,
                        browser: deviceInfo.browser,
                    },
                },
                $set: {
                    lastClickedAt: now,
                },
            }
        );

        return urlEntry.originalUrl;
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch short URL.', 500);
    }
}

export const getCustomShortUrl = async (shortUrl) => {
    try {
        return await urlSchema.findOne({ shortUrl });
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch custom short URL.', 500);
    }
}

export const getShortUrlByOriginalUrl = async (originalUrl) => {
    try {
        return await urlSchema.findOne({ originalUrl });
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch URL.', 500);
    }
}

export const getShortUrlsByUserId = async (userId) => {
    try {
        return await urlSchema
            .find({ user: userId })
            .sort({ createdAt: -1 });
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch user URLs.', 500);
    }
}