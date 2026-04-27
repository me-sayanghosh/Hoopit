import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import connectDB from './src/config/mongo.config.js';
import shortUrlRoute from './src/routes/shortUrl.route.js';
import { redirectfromShortUrl } from './src/controller/shortUrl.controller.js';
import { errorHandler, notFoundHandler } from './src/utils/httpError.js';



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
app.use(notFoundHandler);
app.use(errorHandler);







// this is the function to start the server and connect to the database

const startServer = async () => {
    try {
        await connectDB();
        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

startServer();



//Get- Redirect
