import wrapasync from "../utils/errorHandeler";

export const registerUser = wrapasyncasync (async(req, res) => {
    const {name, email, password} = req.body;
    const user = await User.create({name, email, password});
    res.send('Register route');
})

export const loginUser = wrapasyncasync (async(req, res) => {
    res.send('Login route');
})

