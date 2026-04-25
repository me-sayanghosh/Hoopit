import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import {nanoid} from 'nanoid';
import connectDB from './src/config/mongo.config.js';
import urlSchema from './src/models/shorturl.model.js';
import shortUrlRoute from './src/routes/shortUrl.route.js';





dotenv.config({ path: './.env' });
const app  = express();


dns.setServers(['1.1.1.1', '8.8.8.8']);
app.use(express.json());
app.use(express.urlencoded({extended: true}));






app.use('/api', shortUrlRoute);



app.get('/:id', async (req, res) => {
    const {id} = req.params;
    const urlEntry = await urlSchema.findOne({shortUrl: id});
    if (urlEntry) {
        
        res.redirect(urlEntry.originalUrl);
    } else {
        res.status(404).send('URL not found');
    }
});


app.listen(3000, () => {
    connectDB()
    console.log('Server is running on http://localhost:3000')
})



//Get- Redirect
