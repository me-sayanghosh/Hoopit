import mongoose from "mongoose";
import { AppError } from "../utils/httpError.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    }
    catch (err) {
        throw new AppError(`MongoDB connection failed: ${err.message}`, 500);
    }
}

export default connectDB;