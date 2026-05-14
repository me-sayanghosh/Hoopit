import wrapasync from "../utils/errorHandeler.js";
import { registerUser as registerUserService } from '../services/auth.service.js';

export const registerUser = wrapasync(async (req, res) => {
    const { name, email, password } = req.body;
    const token = await registerUserService(name, email, password);
    res.status(201).json({ token });
});

export const loginUser = wrapasync(async (req, res) => {
    res.status(200).json({ message: 'Login route (not implemented)' });
});

