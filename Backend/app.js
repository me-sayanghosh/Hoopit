import express from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns/promises';
import connectDB from './src/config/mongo.config.js';
import authRoute from './src/routes/auth.route.js';
import shortUrlRoute from './src/routes/shortUrl.route.js';
import domainRoute from './src/routes/domain.route.js';
import { redirectfromShortUrl } from './src/controller/shortUrl.controller.js';
import { errorHandler, notFoundHandler } from './src/utils/httpError.js';
import cors from 'cors';
import { attachUser } from './src/utils/attachUser.js';
import cookieParser from 'cookie-parser';


///this is for dotenv configuration

dotenv.config({ path: './.env' });
const app  = express();
app.set('trust proxy', true);



/// this is for dns configuration to support dns resolution for url redirection

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
dns.setServers(['1.1.1.1', '8.8.8.8']);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(attachUser);

// Log every response's status code and request duration
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});





/// this is the route for creating short url and redirecting from short url to original url

app.use('/api/auth', authRoute);
app.use('/api/create', shortUrlRoute);
app.use('/api/domains', domainRoute);
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



