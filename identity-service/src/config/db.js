const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully to Identity & Verification Service");
    } catch (error) {
        console.error("Database connection failure in Identity Service:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
