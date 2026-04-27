import urlSchema from '../models/shorturl.model.js';


export const saveShortUrl = async (url, shortUrl, userId) => {
    const newUrl = new urlSchema({
                originalUrl: url,
                shortUrl: shortUrl
    })
    if (userId) {
        newUrl.userId = userId;
    }

    await newUrl.save()
}