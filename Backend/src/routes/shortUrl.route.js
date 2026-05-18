import express from 'express';
import { createShortUrl, createCustomShortUrl, getMyShortUrls, getMyShortUrlAnalytics, recordLocationForClick, getSingleShortUrlAnalytics, updateShortUrl, deleteShortUrl, transferShortUrl, getArchivedShortUrls, getTags, getUrlsByTag } from '../controller/shortUrl.controller.js';
import { generateSuggestion } from '../controller/ai.controller.js';
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
	const { url, slug, customAlias } = req.body || {};
	const alias = slug || customAlias;

	if (!url || typeof url !== 'string') {
		return next(new AppError('A valid URL is required.', 400));
	}

	if (!alias || typeof alias !== 'string') {
		return next(new AppError('A valid custom alias is required.', 400));
	}

	next();
};


router.post("/", validateCreateShortUrl, createShortUrl);
router.post("/custom", validateCreateCustomShortUrl, authMiddleware, createCustomShortUrl);
router.post("/suggest", generateSuggestion);
router.post("/track-location", recordLocationForClick);
router.get('/mine', authMiddleware, getMyShortUrls);
router.get('/analytics', authMiddleware, getMyShortUrlAnalytics);
router.get('/analytics/:shortUrl', authMiddleware, getSingleShortUrlAnalytics);
router.patch('/:id', authMiddleware, updateShortUrl);
router.delete('/:id', authMiddleware, deleteShortUrl);
router.post('/:id/transfer', authMiddleware, transferShortUrl);
router.get('/archived', authMiddleware, getArchivedShortUrls);
router.get('/tags', authMiddleware, getTags);
router.get('/tags/:tag', authMiddleware, getUrlsByTag);

export default router;