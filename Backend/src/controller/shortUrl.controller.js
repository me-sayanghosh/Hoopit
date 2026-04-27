import { shortUrlServiceWithoutUser } from '../services/shortUrl.service.js';
import { getShortUrl } from '../dao/shortUrl.js';
import { AppError } from '../utils/httpError.js';



import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export const createShortUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const shortUrl = await shortUrlServiceWithoutUser(url);
        res.status(201).send(process.env.APP_URL + shortUrl);
    }
    catch (err) {
        throw err instanceof AppError ? err : new AppError(err.message || 'Failed to create short URL.', 500);
    }


}


export const redirectfromShortUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await getShortUrl(id);

        if (!url) {
            throw new AppError('Short URL not found.', 404);
        }

        res.redirect(url);
    }
    catch (err) {
        throw err instanceof AppError ? err : new AppError(err.message || 'Failed to redirect short URL.', 500);
    }
}