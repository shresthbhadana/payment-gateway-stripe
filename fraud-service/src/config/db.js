const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully to Fraud & Risk Service");
    }catch(error){
        console.error("Database connection failure in Fraud & Risk Service : ",error.message);
        process.exit(1);
    }
}
module.exports = connectDB;