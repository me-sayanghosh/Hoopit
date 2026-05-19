import express from 'express';
import {registerUser, loginUser, logoutUser, getCurrentUser, updateProfile, deleteAccount} from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateProfile);
router.delete('/me', authMiddleware, deleteAccount);

export default router;