import { generateNanoid } from "../utils/helper.js";
import urlSchema from "../models/shorturl.model.js";
import { saveShortUrl } from "../dao/shortUrl.js";


export const shortUrlServiceWithoutUser =async (url) => {
    const shortUrl = generateNanoid(8);
    await saveShortUrl(url, shortUrl)
    return shortUrl
}

export const shortUrlServicewithUser =async (url, userId) => {
    const shortUrl = generateNanoid(8);
    await saveShortUrl(url, shortUrl, userId)
    return shortUrl
}