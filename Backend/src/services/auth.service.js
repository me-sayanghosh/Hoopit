import { createUser, findUserByEmail } from '../dao/user.dao.js';
import { signToken } from '../utils/helper.js';
import { AppError } from '../utils/httpError.js';

export const registerUser = async (name, email, password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new AppError('Password must be at least 8 characters and include uppercase, lowercase, number and special character', 400);
    }
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