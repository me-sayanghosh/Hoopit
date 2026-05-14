import { verifyToken } from '../utils/helper.js';
import { findUserById } from '../dao/user.dao.js';
import { AppError } from '../utils/httpError.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next(new AppError('Unauthorized: No token provided', 401));

    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded.id);
        if (!user) return next(new AppError('Unauthorized: User not found', 401));
        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Unauthorized: Invalid token', 401));
    }
};