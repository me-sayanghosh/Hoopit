import { shortUrlServiceWithoutUser } from '../services/shortUrl.service.js';
import { getShortUrl } from '../dao/shortUrl.js';
import { AppError } from '../utils/httpError.js';
import wrapasync from '../utils/errorHandeler.js';



import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


export const createShortUrl = wrapasync(async (req, res) => {
    const { url } = req.body;
    const shortUrl = await shortUrlServiceWithoutUser(url);
    res.status(201).send(process.env.APP_URL + shortUrl);
});


export const redirectfromShortUrl = wrapasync(async (req, res) => {
    const { id } = req.params;
    const url = await getShortUrl(id);

    if (!url) {
        throw new AppError('Short URL not found.', 404);
    }

    res.redirect(url);
});