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

const parseCoordinate = (value) => {
    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
};

const getLocation = async (req, ip) => {
    const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const city = req.headers['x-vercel-ip-city'] || '';
    const latitude = parseCoordinate(req.headers['x-vercel-ip-latitude'] || req.headers['cf-iplatitude']);
    const longitude = parseCoordinate(req.headers['x-vercel-ip-longitude'] || req.headers['cf-iplongitude']);

    if (country || region || city) {
        return {
            country: country || 'Unknown',
            region: region || 'Unknown',
            city: city || 'Unknown',
            latitude,
            longitude,
        };
    }

    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return {
            country: 'IN',
            region: 'Delhi',
            city: 'New Delhi',
            latitude: 28.7041,
            longitude: 77.1025,
        };
    }

    if (ip) {
        try {
            const response = await fetch(`http://ip-api.com/json/${ip}`, {
                signal: AbortSignal.timeout(1500)
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    return {
                        country: data.country || 'Unknown',
                        region: data.regionName || 'Unknown',
                        city: data.city || 'Unknown',
                        latitude: data.lat ?? null,
                        longitude: data.lon ?? null,
                    };
                }
            }
        } catch (error) {
            console.error('IP-API lookup failed:', error);
        }
    }

    const lookup = ip ? geoip.lookup(ip) : null;
    const [lookupLatitude, lookupLongitude] = Array.isArray(lookup?.ll) ? lookup.ll : [null, null];

    return {
        country: lookup?.country || 'Unknown',
        region: lookup?.region || 'Unknown',
        city: lookup?.city || 'Unknown',
        latitude: typeof latitude === 'number' ? latitude : (typeof lookupLatitude === 'number' ? lookupLatitude : null),
        longitude: typeof longitude === 'number' ? longitude : (typeof lookupLongitude === 'number' ? lookupLongitude : null),
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
    const { originalUrl, shortUrl, userId, alias, domain, tags, comments, title, description, folder, conversionTracking, qrCodeUrl, isDraft } = opts;
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
            qrCodeUrl: qrCodeUrl || '',
            isDraft: !!isDraft
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
        const location = await getLocation(req, ip);
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
                        latitude: location.latitude,
                        longitude: location.longitude,
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
            .find({ user: userId, isDraft: { $ne: true } })
            .sort({ createdAt: -1 });
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch user URLs.', 500);
    }
}

export const getDraftShortUrlsByUserId = async (userId) => {
    try {
        return await urlSchema
            .find({ user: userId, isDraft: true })
            .sort({ createdAt: -1 });
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch user drafts.', 500);
    }
}

export const getArchivedShortUrlsByUserId = async (userId) => {
    try {
        return await urlSchema
            .find({ user: userId, archived: true, isDraft: { $ne: true } })
            .sort({ createdAt: -1 });
    } catch (err) {
        throw new AppError(err.message || 'Failed to fetch archived URLs.', 500);
    }
}

export const getTagsForUser = async (userId) => {
    try {
        // unwind tags and count occurrences
        const rows = await urlSchema.aggregate([
            { $match: { user: userId } },
            { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } }
        ]);

        return rows.map(r => ({ tag: r._id, count: r.count }));
    } catch (err) {
        throw new AppError(err.message || 'Failed to fetch tags.', 500);
    }
}

export const getUrlsByTagForUser = async (userId, tag) => {
    try {
        return await urlSchema.find({ user: userId, tags: tag }).sort({ createdAt: -1 });
    } catch (err) {
        throw new AppError(err.message || 'Failed to fetch URLs for tag.', 500);
    }
}

export const updateShortUrlById = async (id, userId, updates = {}) => {
    try {
        const query = { _id: id };
        if (userId) query.user = userId;

        const allowed = ['originalUrl', 'alias', 'title', 'description', 'folder', 'tags', 'comments', 'conversionTracking', 'qrCodeUrl', 'archived', 'isDraft'];
        const set = {};
        allowed.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(updates, k)) set[k] = updates[k];
        });

        if (Object.keys(set).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        const updated = await urlSchema.findOneAndUpdate(query, { $set: set }, { new: true });
        if (!updated) throw new AppError('URL not found or not owned by user', 404);
        return updated;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to update URL', 500);
    }
}

export const deleteShortUrlById = async (id, userId) => {
    try {
        const query = { _id: id };
        if (userId) query.user = userId;

        const removed = await urlSchema.findOneAndDelete(query);
        if (!removed) throw new AppError('URL not found or not owned by user', 404);
        return removed;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to delete URL', 500);
    }
}

export const transferShortUrlToUserId = async (id, userId, targetUserId) => {
    try {
        const query = { _id: id, user: userId };
        const updated = await urlSchema.findOneAndUpdate(query, { $set: { user: targetUserId } }, { new: true });
        if (!updated) throw new AppError('URL not found or not owned by user', 404);
        return updated;
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(err.message || 'Failed to transfer URL', 500);
    }
}