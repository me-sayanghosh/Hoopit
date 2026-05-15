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

