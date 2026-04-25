import express from 'express';
import { nanoid } from 'nanoid';
const router = express.Router();
import { createShortUrl } from '../controller/shortUrl.controller.js';



router.post("/", createShortUrl);

export default router;