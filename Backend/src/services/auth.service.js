import { createUser, findUserByEmail } from '../dao/user.dao.js';
import { signToken } from '../utils/helper.js';
import { AppError } from '../utils/httpError.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js';
import crypto from 'crypto';
import { isEmailConfigured, sendPasswordResetCode } from '../utils/email.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const RESET_CODE_TTL_MINUTES = 10;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const hashResetCode = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
};

const createResetCode = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const assertStrongPassword = (password) => {
    if (!PASSWORD_REGEX.test(password)) {
        throw new AppError('Password must be at least 8 characters and include uppercase, lowercase, number and special character', 400);
    }
};

const assertEmail = (email) => {
    if (!EMAIL_REGEX.test(email || '')) {
        throw new AppError('Please enter a valid email address', 400);
    }
};

const assertCode = (code) => {
    if (!/^\d{6}$/.test(code || '')) {
        throw new AppError('Enter a valid 6 digit verification code', 400);
    }
};

export const registerUser = async (name, email, password) => {
    assertStrongPassword(password);
    const user = await findUserByEmail(email);
    if (user) throw new AppError('User already exists', 409);

    const newUser = await createUser(name, email, password);
    const token = signToken({ id: newUser._id });
    return token;
};

export const loginUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    if (user.password !== password) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = signToken({ id: user._id });
    return token;
};

export const googleLoginUser = async (credential) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
        throw new AppError('GOOGLE_CLIENT_ID is not set in environment', 500);
    }

    if (!credential) {
        throw new AppError('Google credential is required', 400);
    }

    const googleClient = new OAuth2Client(googleClientId);
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
        throw new AppError('Google account did not provide the required profile information', 400);
    }

    if (payload.email_verified === false) {
        throw new AppError('Please verify your Google email before signing in', 401);
    }

    const email = payload.email.toLowerCase();
    const googleProfile = {
        googleId: payload.sub,
        name: payload.name || email.split('@')[0],
        email,
        avater: payload.picture,
        authProvider: 'google',
    };

    let user = await User.findOne({
        $or: [
            { googleId: googleProfile.googleId },
            { email: googleProfile.email },
        ],
    });

    if (!user) {
        user = await User.create(googleProfile);
    } else {
        user.googleId = user.googleId || googleProfile.googleId;
        user.authProvider = user.authProvider || 'google';
        user.name = user.name || googleProfile.name;
        if (googleProfile.avater) user.avater = googleProfile.avater;
        await user.save();
    }

    return signToken({ id: user._id });
};

export const requestPasswordReset = async (email) => {
    assertEmail(email);
    const user = await findUserByEmail(email);
    if (!user) return { sent: isEmailConfigured() };

    const code = createResetCode();
    user.passwordResetCodeHash = hashResetCode(code);
    user.passwordResetCodeExpires = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);
    user.passwordResetVerified = false;
    await user.save();

    const sent = await sendPasswordResetCode(user.email, code);

    return {
        sent,
        devCode: sent ? undefined : code,
    };
};

export const verifyPasswordResetCode = async (email, code) => {
    assertEmail(email);
    assertCode(code);
    const user = await findUserByEmail(email);
    if (!user || !user.passwordResetCodeHash || !user.passwordResetCodeExpires) {
        throw new AppError('Invalid or expired verification code', 400);
    }

    if (user.passwordResetCodeExpires.getTime() < Date.now()) {
        throw new AppError('Invalid or expired verification code', 400);
    }

    if (user.passwordResetCodeHash !== hashResetCode(code)) {
        throw new AppError('Invalid or expired verification code', 400);
    }

    user.passwordResetVerified = true;
    await user.save();
};

export const resetPassword = async (email, code, password) => {
    assertEmail(email);
    assertCode(code);
    assertStrongPassword(password);

    const user = await findUserByEmail(email);
    if (!user || !user.passwordResetVerified || !user.passwordResetCodeHash || !user.passwordResetCodeExpires) {
        throw new AppError('Please verify your reset code before setting a new password', 400);
    }

    if (user.passwordResetCodeExpires.getTime() < Date.now() || user.passwordResetCodeHash !== hashResetCode(code)) {
        throw new AppError('Invalid or expired verification code', 400);
    }

    user.password = password;
    user.passwordResetCodeHash = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = false;
    await user.save();
};
