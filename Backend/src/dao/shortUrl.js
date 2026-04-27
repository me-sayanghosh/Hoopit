import urlSchema from '../models/shorturl.model.js';
import { AppError } from '../utils/httpError.js';


export const saveShortUrl = async (url, shortUrl, userId) => {
    try {
        const newUrl = new urlSchema({
            originalUrl: url,
            shortUrl: shortUrl
        });

        if (userId) {
            newUrl.user = userId;
        }

        await newUrl.save();
    }
    catch (err) {
        if (err.code === 11000) {
            throw new AppError('Short URL already exists. Please try again.', 409);
        }

        throw new AppError(err.message || 'Failed to save short URL.', 500);
    }
}



export const getShortUrl = async (shortUrl) => {
    try {
        const urlEntry = await urlSchema.findOneAndUpdate(
            { shortUrl: shortUrl },
            { $inc: { clicks: 1 } }
        );

        return urlEntry ? urlEntry.originalUrl : null;
    }
    catch (err) {
        throw new AppError(err.message || 'Failed to fetch short URL.', 500);
    }
}