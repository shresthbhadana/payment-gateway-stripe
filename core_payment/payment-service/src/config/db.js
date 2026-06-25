const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/payment_service_db");
        console.log(`Payment DB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Failure in Payment Service: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
