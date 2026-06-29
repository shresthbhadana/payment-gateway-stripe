const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully to Tax & Accounting Service");
    } catch (error) {
        console.error("Database connection failure in Tax Service:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
