import express from 'express';
import { createShortUrl, createCustomShortUrl } from '../controller/shortUrl.controller.js';
import { AppError } from '../utils/httpError.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

const validateCreateShortUrl = (req, res, next) => {
	const { url } = req.body || {};

	if (!url || typeof url !== 'string') {
		return next(new AppError('A valid URL is required.', 400));
	}

	next();
};

const validateCreateCustomShortUrl = (req, res, next) => {
	const { url, customAlias } = req.body || {};

	if (!url || typeof url !== 'string') {
		return next(new AppError('A valid URL is required.', 400));
	}

	if (!customAlias || typeof customAlias !== 'string') {
		return next(new AppError('A valid custom alias is required.', 400));
	}

	next();
};


router.post("/", validateCreateShortUrl, createShortUrl);
router.post("/custom", validateCreateCustomShortUrl, authMiddleware, createCustomShortUrl);

export default router;