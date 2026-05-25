import { verifyToken } from '../utils/helper.js';
import { findUserById } from '../dao/user.dao.js';
import { AppError } from '../utils/httpError.js';

/**
 * Extract the JWT from cookies first (preferred), then fall back to
 * the Authorization: Bearer <token> header.  Safari's ITP blocks
 * cross-site cookies set with SameSite=None, so the frontend sends
 * the token via the Authorization header as a fallback.
 */
const extractToken = (req) => {
    if (req.cookies?.token) return req.cookies.token;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
};

export const authMiddleware = async (req, res, next) => {
    const token = extractToken(req);
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