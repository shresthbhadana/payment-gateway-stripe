const mongoose = require("mongoose");

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDb is connected successfully to billing database")
    }catch(error){
        console.log("Database connection failure",error.messgae);
        process.exit(1);
    }
};
module.exports = connectDB;