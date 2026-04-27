import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import {nanoid} from 'nanoid';
import connectDB from './src/config/mongo.config.js';
import urlSchema from './src/models/shorturl.model.js';
import shortUrlRoute from './src/routes/shortUrl.route.js';
import { redirectfromShortUrl } from './src/controller/shortUrl.controller.js';



///this is for dotenv configuration

dotenv.config({ path: './.env' });
const app  = express();



/// this is for dns configuration to support dns resolution for url redirection

dns.setServers(['1.1.1.1', '8.8.8.8']);
app.use(express.json());
app.use(express.urlencoded({extended: true}));





/// this is the route for creating short url and redirecting from short url to original url
app.use('/api/create', shortUrlRoute);

app.get('/:id', redirectfromShortUrl);


app.listen(3000, () => {
    connectDB()
    console.log('Server is running on http://localhost:3000')
})



//Get- Redirect
