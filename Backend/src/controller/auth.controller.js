import wrapasync from "../utils/errorHandeler.js";
import { cookieOptions } from "../config/cofig.js";
import { registerUser as registerUserService, loginUser as loginUserService } from '../services/auth.service.js';

export const registerUser = wrapasync(async (req, res) => {
    const { name, email, password } = req.body;
    const token = await registerUserService(name, email, password);

    res.cookie('token', token, cookieOptions);

    res.status(201).json({ message: 'User registered successfully' });
});

export const loginUser = wrapasync(async (req, res) => {
    const { email, password } = req.body;
    const token = await loginUserService(email, password);

    res.cookie('token', token, cookieOptions);

    res.status(200).json({ message: 'User logged in successfully' });
});

export const logoutUser = wrapasync(async (req, res) => {
    res.clearCookie('token', cookieOptions);

    res.status(200).json({ message: 'User logged out successfully' });
});

export const getCurrentUser = wrapasync(async (req, res) => {
    const user = req.user;

    res.status(200).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avater,
        }
    });
});

import { updateUser as updateUserDao, deleteUser as deleteUserDao } from '../dao/user.dao.js';

export const updateProfile = wrapasync(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    const updated = await updateUserDao(user._id, { name });
    res.status(200).json({
        message: 'Profile updated successfully',
        user: {
            id: updated._id,
            name: updated.name,
            email: updated.email,
            avatar: updated.avater,
        }
    });
});

export const deleteAccount = wrapasync(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    await deleteUserDao(user._id);
    res.clearCookie('token', cookieOptions);
    res.status(200).json({ message: 'Profile deleted successfully' });
});


