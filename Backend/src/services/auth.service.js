import { createUser, findUserByEmail } from '../dao/user.dao.js';
import { signToken } from '../utils/helper.js';
import { AppError } from '../utils/httpError.js';

export const registerUser = async (name, email, password) => {
    const user = await findUserByEmail(email);
    if (user) throw new AppError('User already exists', 409);

    const newUser = await createUser(name, email, password);
    const token = signToken({ id: newUser._id });
    return token;
};