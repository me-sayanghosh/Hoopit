import { verifyToken } from './helper.js';
import { findUserById } from '../dao/user.dao.js';

/**
 * Extract the JWT from cookies first, then fall back to
 * Authorization: Bearer <token> header (Safari ITP workaround).
 */
const extractToken = (req) => {
    if (req.cookies?.token) return req.cookies.token;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
};

export const attachUser = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next();

    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded.id);
        if (!user) return next();
        req.user = user;
        next();
    } catch (error) {
        next();
    }
};