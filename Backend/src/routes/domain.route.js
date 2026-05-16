import express from 'express';
import { getDomains, postDomain } from '../controller/domain.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getDomains);
router.post('/', authMiddleware, postDomain);

export default router;
