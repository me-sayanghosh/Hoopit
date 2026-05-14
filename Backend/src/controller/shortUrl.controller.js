import { shortUrlServiceWithoutUser, shortUrlServicewithUser } from '../services/shortUrl.service.js';
import { getShortUrl } from '../dao/shortUrl.js';
import { AppError } from '../utils/httpError.js';
import wrapasync from '../utils/errorHandeler.js';



import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export const createShortUrl = wrapasync(async (req, res) => {
    const { url, slug, customAlias } = req.body;
    const shortAlias = slug || customAlias;
    let shortUrl;

    if (shortAlias) {
        const userId = req.user?._id;
        shortUrl = await shortUrlServicewithUser(url, userId, shortAlias);
    } else if (req.user) {
        shortUrl = await shortUrlServicewithUser(url, req.user._id);
    } else {
        shortUrl = await shortUrlServiceWithoutUser(url);
    }

    res.status(201).json({
        shortUrl: process.env.APP_URL + shortUrl
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
    const url = await getShortUrl(id);

    if (!url) {
        throw new AppError('Short URL not found.', 404);
    }

    res.redirect(url);
});