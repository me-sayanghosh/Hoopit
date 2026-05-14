import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { AppError } from './httpError.js';

export const generateNanoid = (length) => {
    return nanoid(length);
};

export const signToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET is not set in environment', 500);
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET is not set in environment', 500);
    return jwt.verify(token, secret);
};