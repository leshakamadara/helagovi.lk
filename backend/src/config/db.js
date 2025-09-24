import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfuly!");
        return true;
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        throw error; // Don't exit, let the calling code handle it
    }
};