import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import {nanoid} from 'nanoid';
import connectDB from './src/config/mongo.config.js';
import urlSchema from './src/models/shorturl.model.js';

dotenv.config({ path: './.env' });
const app  = express();


dns.setServers(['1.1.1.1', '8.8.8.8']);
app.use(express.json());
app.use(express.urlencoded({extended: true}));






app.post('/api/create', (req, res) => {
    const  {url}  = req.body;
    if (!url) {
        return res.status(400).send('URL is required');
    }
    const shortUrl = nanoid(8);
    const newUrl = new urlSchema({
        originalUrl: url,
        shortUrl: shortUrl
    })
    newUrl.save();
    res.send(nanoid(8));
});


app.listen(3000, () => {
    connectDB()
    console.log('Server is running on http://localhost:3000')
})



//Get- Redirect
//Post- Create short url