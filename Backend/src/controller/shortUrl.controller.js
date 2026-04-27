import {generateNanoid} from '../utils/helper.js';
import urlSchema from '../models/shorturl.model.js';
import { shortUrlServiceWithoutUser } from '../services/shortUrl.service.js';
import dotenv from 'dotenv';




dotenv.config({ path: './.env' });


export const createShortUrl = async (req, res) => {
    const  {url}  = req.body;
    const shortUrl = await shortUrlServiceWithoutUser(url);
    res.send (process.env.APP_URL + shortUrl)


}


export const redirectfromShortUrl = async (req, res) => {
    const {id} = req.params;
    const urlEntry = await urlSchema.findOne({shortUrl: id});
    if (urlEntry) {
        
        res.redirect(urlEntry.originalUrl);
    } else {
        res.status(404).send('URL not found');
    }
}