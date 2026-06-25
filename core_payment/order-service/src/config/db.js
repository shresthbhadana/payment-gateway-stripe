const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/order_service_db");
        console.log(`Order DB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Failure in Order Service: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
