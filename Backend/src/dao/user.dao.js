

import User from '../models/user.model.js';

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const findUserById = async (id) => {
    return await User.findById(id);
};

export const createUser = async (name, email, password) => {
    const newUser = await User.create({ name, email, password });
    await newUser.save();
    return newUser;
};

export const updateUser = async (id, updates) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    if (updates.name !== undefined) user.name = updates.name;
    await user.save();
    return user;
};

export const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    await User.deleteOne({ _id: id });
    return user;
};
