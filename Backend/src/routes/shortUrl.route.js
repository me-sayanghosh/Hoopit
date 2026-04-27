import express from 'express';
import { createShortUrl } from '../controller/shortUrl.controller.js';
import { AppError, asyncHandler } from '../utils/httpError.js';

const router = express.Router();

const validateCreateShortUrl = (req, res, next) => {
	const { url } = req.body || {};

	if (!url || typeof url !== 'string') {
		return next(new AppError('A valid URL is required.', 400));
	}

	next();
};



router.post("/", validateCreateShortUrl, asyncHandler(createShortUrl));

export default router;