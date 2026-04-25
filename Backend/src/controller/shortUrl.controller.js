import {generateNanoid} from '../utils/helper.js';
import urlSchema from '../models/shorturl.model.js';


export const createShortUrl = async (req, res) => {
    const  {url}  = req.body;
    const shortUrl = generateNanoid(8);
    const newUrl = new urlSchema({
        originalUrl: url,
        shortUrl: shortUrl
    })
    newUrl.save();
    res.send(nanoid(8))
}