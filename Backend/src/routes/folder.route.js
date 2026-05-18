import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getFolders, postFolder, putFolder, deleteFolder } from '../controller/folder.controller.js';

const router = express.Router();

router.get('/', authMiddleware, getFolders);
router.post('/', authMiddleware, postFolder);
router.put('/:id', authMiddleware, putFolder);
router.delete('/:id', authMiddleware, deleteFolder);

export default router;